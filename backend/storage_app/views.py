import mimetypes, hashlib
from io import BytesIO
import os
import traceback
import requests
import json
import time

from django.http import JsonResponse, FileResponse, Http404
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User, AnonymousUser   # ✅ add AnonymousUser
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny

from .hf_classifier import ZometricMailClassifier
from .models import UploadedFile, FileGroup, supabase, SUPABASE_BUCKET_NAME
from .serializers import UserSignupSerializer, UploadedFileSerializer, FileGroupSerializer
from .supabase_client import upload_file_to_supabase
from .openrouter_client import get_openrouter_client


mail_classifier = ZometricMailClassifier()

# AUTH FUNCTIONS (UNCHANGED)
@method_decorator(csrf_exempt, name='dispatch')
class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSignupSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        Token.objects.create(user=user)
        self.request.session.save()

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(username=username, password=password)
    if not user:
        return Response({"detail": "Invalid credentials"}, status=400)
    token, _ = Token.objects.get_or_create(user=user)
    login(request, user)
    request.session.save()
    return Response({
        "token": token.key,
        "username": user.username,
        "message": "Login successful"
    })

@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    Token.objects.filter(user=request.user).delete()
    logout(request)
    request.session.flush()
    return Response({"detail": "Logged out - All sessions cleared"})

@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    return Response({
        "username": request.user.username,
        "email": request.user.email,
        "date_joined": request.user.date_joined,
        "tokens": list(Token.objects.filter(user=request.user).values_list('key', flat=True))
    })

# 🔥 GROUP PROCESSING - REPROCESS FAILED FILES
@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def process_all_files(request):
    user_files = UploadedFile.objects.filter(
        user=request.user, 
        ai_status__in=["PROCESSING", "FAILED"],
        mime_type__startswith=('audio/', 'video/')
    ).select_related('group').order_by('-created_at')
    
    results = []
    call_nova = get_openrouter_client()
    
    for obj in user_files:
        try:
            group_id = getattr(obj.group, 'group_id', 'N/A')
            print(f"🔄 Processing {group_id}.{obj.sub_id}: {obj.original_name}")
            
            # Download file from Supabase for reprocessing
            file_bytes = requests.get(obj.supabase_url).content
            
            summary_result = call_nova(
                f"Analyze existing {obj.mime_type} file:\n"
                f"Group: {group_id}\n"
                f"File: {obj.original_name}\n"
                f"Note: {obj.note}\n"
                f"Reprocessing failed file.",
                max_tokens=500
            )
            
            obj.transcript = "[Full transcript requires file re-upload]"
            obj.summary = summary_result['choices'][0]['message']['content']
            obj.ai_status = "COMPLETED"
            obj.save()
            
            results.append({
                "group_id": group_id,
                "sub_id": obj.sub_id,
                "filename": obj.original_name,
                "status": obj.ai_status,
                "summary_preview": obj.summary[:100] + "..."
            })
        except Exception as e:
            results.append({
                "group_id": "N/A", 
                "sub_id": getattr(obj, 'sub_id', 'N/A'), 
                "error": str(e)
            })
    
    return Response({
        "message": f"Processed {len(results)} audio/video files",
        "success_count": len([r for r in results if "error" not in r]),
        "files": results
    })

# 🔥 MAIN FILES ENDPOINT
@csrf_exempt
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def files_view(request):
    if request.method == "GET":
        groups = FileGroup.objects.filter(user=request.user).order_by('-created_at')
        return Response(FileGroupSerializer(groups, many=True).data)

    files = request.FILES.getlist("files")
    note = request.data.get("note", "").strip()
    
    if not note:
        return Response({"detail": "Note is MANDATORY"}, status=400)
    if not files:
        return Response({"detail": "Files are required"}, status=400)

    # 🔥 STEP 1: PERFECT DUPLICATE CHECK + DEBUG
    file_bytes_list = []
    duplicate_files = []
    
    print(f"🔍 Checking {len(files)} files for duplicates...")
    
    for uploaded_file in files:
        uploaded_file.seek(0)
        file_bytes = uploaded_file.read()
        uploaded_file.seek(0)  # Reset
        file_hash = hashlib.sha256(file_bytes).hexdigest()
        
        # 🔥 DEBUG: Show hash check
        existing = UploadedFile.objects.filter(user=request.user, file_hash=file_hash).exists()
        print(f"File: {uploaded_file.name} | Hash: {file_hash[:16]}... | Duplicate: {existing}")
        
        if existing:
            duplicate_files.append(uploaded_file.name)
        file_bytes_list.append((uploaded_file, file_bytes))
    
    # 🚫 IMMEDIATE BLOCK - NO GROUP CREATION
    if duplicate_files:
        return Response({
            "error": "🚫 UPLOAD BLOCKED - DUPLICATE FILES",
            "duplicates": duplicate_files,
            "message": f"Files '{', '.join(duplicate_files)}' already exist in your database. Remove or rename before uploading.",
            "total_files": len(files),
            "duplicate_count": len(duplicate_files)
        }, status=409)

    # ✅ STEP 2: ALL UNIQUE - Create group
    user_groups_count = FileGroup.objects.filter(user=request.user).count()
    timestamp = int(time.time())
    group_id = f"G{request.user.id}-{user_groups_count + 1}-{timestamp % 10000}"
    
    while FileGroup.objects.filter(group_id=group_id).exists():
        timestamp += 1
        group_id = f"G{request.user.id}-{user_groups_count + 1}-{timestamp % 10000}"
    
    print(f"🎯 Creating group: {group_id}")
    
    group = FileGroup.objects.create(
        user=request.user,
        group_id=group_id,
        note=note,
        total_files=len(files)
    )

    results = []
    for index, (uploaded_file, file_bytes) in enumerate(file_bytes_list, 1):
        try:
            file_hash = hashlib.sha256(file_bytes).hexdigest()
            sub_id = str(index)

            buffer = BytesIO(file_bytes)
            path, public_url = upload_file_to_supabase(request.user.id, buffer, uploaded_file.name)
            mime_type = mimetypes.guess_type(uploaded_file.name)[0] or ""

            obj = UploadedFile.objects.create(
                group=group,
                user=request.user,
                sub_id=sub_id,
                note=note,
                original_name=uploaded_file.name,
                supabase_path=path,
                supabase_url=public_url,
                mime_type=mime_type,
                size=len(file_bytes),
                file_hash=file_hash,
                ai_status="PROCESSING" if mime_type.startswith(('audio/', 'video/')) else "COMPLETED"
            )

            if mime_type.startswith(('audio/', 'video/')):
                if mime_type.startswith('audio/'):
                    process_audio_file(obj, file_bytes)
                else:
                    process_video_file(obj, file_bytes)
            else:
                obj.summary = f"📁 {uploaded_file.name}\n📝 {note}"
                obj.save()

            results.append(UploadedFileSerializer(obj).data)
            
        except Exception as e:
            results.append({"filename": uploaded_file.name, "error": str(e)})

    # CLASSIFY & NOTIFY (unchanged)
    for result in results:
        if isinstance(result, dict) and 'id' in result:
            try:
                obj = UploadedFile.objects.get(id=result['id'], ai_status="COMPLETED")
                if obj.summary and mail_classifier:
                    classification = mail_classifier.classify_summary(obj.summary)
                    obj.keywords = f"{classification['team']} ({classification['confidence']:.0%})"
                    obj.save()
                    send_team_notification(obj, classification)
            except Exception as e:
                print(f"Classification error: {e}")

    group.total_files = len([r for r in results if 'error' not in r])
    group.save()

    return Response({
        "message": f"✅ Created Group {group_id} ({len(files)} files)",
        "group_id": group_id,
        "group_url": f"/files/{group_id}/",
        "results": results
    }, status=201)


# 🔥 GROUP DETAIL - FIXED TO SHOW note & created_at
@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def group_detail(request, group_id):
    try:
        group = FileGroup.objects.get(user=request.user, group_id=group_id)
        data = {
            "group_id": group.group_id,
            "note": group.note,
            "created_at": group.created_at.isoformat(),
            "total_files": group.total_files,
            "ai_status": group.ai_status,
            "files": FileGroupSerializer(group).data['files'],
            "file_count": len(group.files.all())
        }
        return Response(data)
    except FileGroup.DoesNotExist:
        return Response({"error": f"Group {group_id} not found"}, status=404)


# 🔥 SINGLE send_team_notification (NO DUPLICATES)
def send_team_notification(obj: UploadedFile, classification: dict):
    teams = {
        'CEO': 'chiluverichethankumar@gmail.com',
        'Product': 'chethankumarchiluveri@gmail.com',
        'Dev': 'cchiluve@gitam.in',
        'Support': 'postmantesting86@gmail.com',
        'Client': 'chethankumarchiluveri@gmail.com'
    }
    
    team_email = teams.get(classification['team'], 'general@example.com')
    
    subject = f"🚨 New AI File: {classification['team']} ({classification['confidence']:.0%})"
    message = f"""
New file auto-routed to {classification['team']} team:

📁 File: {obj.original_name} | Group: {obj.group.group_id}.{obj.sub_id}
📝 Note: {obj.note}
🎯 Summary: {obj.summary[:200]}...
🔗 Link: {obj.supabase_url}
📊 Confidence: {classification['confidence']:.0%}
Type: {obj.mime_type}

-- Zometric AI CRM
"""
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[team_email],
            fail_silently=True,
        )
        print(f"✅ Email sent to {team_email}")
    except Exception as e:
        print(f"❌ Email failed: {e}")

# 🔥 PROCESSING FUNCTIONS
def process_audio_file(obj: UploadedFile, file_bytes: bytes = None) -> None:
    print(f"🔊 Processing audio: {obj.original_name}")
    if file_bytes is None or len(file_bytes) == 0:
        file_bytes = b''
    result = transcribe_audio_file_bulletproof(obj, file_bytes)
    transcript = result['text']
    call_nova = get_openrouter_client()
    summary_result = call_nova(
        f"Create perfect summary from this audio:\n"
        f"File: {obj.original_name}\n"
        f"Note: {obj.note}\n"
        f"Transcript: {transcript[:4000]}",
        max_tokens=2000
    )
    obj.transcript = transcript
    obj.summary = summary_result['choices'][0]['message']['content']
    obj.ai_status = "COMPLETED"
    obj.save()

def process_video_file(obj: UploadedFile, file_bytes: bytes = None) -> None:
    print(f"🎥 Processing video: {obj.original_name}")
    if file_bytes is None or len(file_bytes) == 0:
        file_bytes = b''
    result = transcribe_audio_file_bulletproof(obj, file_bytes)
    transcript = result['text']
    call_nova = get_openrouter_client()
    summary_result = call_nova(
        f"Analyze video content:\n"
        f"File: {obj.original_name}\n"
        f"Note: {obj.note}\n"
        f"Transcript: {transcript[:3000]}",
        max_tokens=1500
    )
    obj.transcript = transcript
    obj.summary = summary_result['choices'][0]['message']['content']
    obj.ai_status = "COMPLETED"
    obj.save()

def transcribe_audio_file_bulletproof(file_obj: UploadedFile, file_bytes: bytes) -> dict:
    GLADIA_KEY = getattr(settings, "GLADIA_API_KEY", None)
    if not GLADIA_KEY:
        raise Exception("GLADIA_API_KEY missing")
    url = "https://api.gladia.io/audio/text/audio-transcription/"
    files = {
        "audio": (file_obj.original_name, file_bytes, file_obj.mime_type or "video/mp4")
    }
    data = {
        "language": "en",
        "enable_vad": "false",
        "output_format": "plain"
    }
    response = requests.post(
        url,
        headers={"x-gladia-key": GLADIA_KEY},
        files=files,
        data=data,
        timeout=120
    )
    print("GLADIA:", response.status_code, response.text[:200])
    if response.status_code != 200:
        raise Exception(f"Gladia error: {response.text}")
    text = response.text.strip()
    if not text:
        text = "[empty]"
    return {
        "text": text,
        "duration": len(file_bytes) / 16000
    }

# 🔥 TEST FUNCTIONS
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def test_nova(request):
    try:
        call_nova = get_openrouter_client()
        prompt = request.data.get('prompt', 'Hello from Zometric!')
        result = call_nova(prompt)
        return Response({
            'success': True,
            'model': result['model'],
            'response': result['choices'][0]['message']['content']
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def transcribe_audio(request):
    try:
        note = request.data.get("note", "").strip()
        if not note:
            return Response({'error': 'Note is MANDATORY'}, status=400)
        
        audio_file = request.FILES.get('audio') or request.FILES.get('file')
        if not audio_file:
            return Response({'error': 'Audio file required'}, status=400)
        
        audio_bytes = audio_file.read()
        filename = audio_file.name
        
        # Create dummy objects for testing
        dummy_user = User.objects.first()
        if not dummy_user:
            return Response({'error': 'No users exist for testing'}, status=400)
            
        dummy_group = FileGroup.objects.create(
            user=dummy_user,
            group_id=f"test_{int(time.time())}",
            note=note,
            total_files=1
        )
        
        dummy_obj = UploadedFile.objects.create(
            group=dummy_group,
            user=dummy_user,
            sub_id="1",
            note=note,
            original_name=filename,
            supabase_path=f"temp/{filename}",
            supabase_url=f"temp/{filename}",
            mime_type=audio_file.content_type or 'audio/mpeg',
            size=len(audio_bytes),
            file_hash=hashlib.sha256(audio_bytes).hexdigest()[:16],
            ai_status="TEMP"
        )
        
        result = transcribe_audio_file_bulletproof(dummy_obj, audio_bytes)
        
        # Cleanup
        dummy_obj.delete()
        dummy_group.delete()
        
        return Response({
            'success': True,
            'note': note,
            'text': result['text'],
            'duration': result['duration'],
            'filename': filename
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def test_email(request):
    try:
        send_mail(
            subject="🔥 TEST EMAIL - Zometric Working!",
            message="Your Zometric emails are LIVE!\n\nTest successful!",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['chethankumarchiluveri@gmail.com'],
            fail_silently=False,
        )
        print("✅ TEST EMAIL SENT!")
        return Response({"status": "✅ Email sent! Check spam folder!"})
    except Exception as e:
        print(f"❌ TEST EMAIL FAILED: {e}")
        return Response({"error": str(e)}, status=500)


@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_file_view(request, file_id):
    """
    Download a file for the authenticated user.

    Supports:
      - Authorization: Token <key> header (normal DRF auth)
      - ?token=<key> query param (for browser / Linking.openURL)
    """

    # 1) If not already authenticated via header, try ?token=<key>
    if isinstance(request.user, AnonymousUser) or not request.user.is_authenticated:
        token_key = request.GET.get("token")
        if token_key:
            try:
                token = Token.objects.get(key=token_key)
                request.user = token.user
            except Token.DoesNotExist:
                # Invalid token → behave as not authenticated
                return Response(
                    {"detail": "Invalid token."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

    # 2) If still not authenticated, reject
    if not request.user or not request.user.is_authenticated:
        return Response(
            {"detail": "Authentication credentials were not provided."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # 3) Fetch file belonging to this user
    try:
        obj = UploadedFile.objects.get(id=file_id, user=request.user)
    except UploadedFile.DoesNotExist:
        raise Http404("File not found")

    # 4) Download from Supabase and stream back
    file_bytes = supabase.storage.from_(SUPABASE_BUCKET_NAME).download(obj.supabase_path)
    buffer = BytesIO(file_bytes)

    return FileResponse(
        buffer,
        as_attachment=True,
        filename=obj.original_name,
        content_type=obj.mime_type or "application/octet-stream",
    )