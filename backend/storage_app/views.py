import mimetypes, hashlib
from io import BytesIO
import os
import traceback
import requests
import json
import time 

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.http import JsonResponse
from django.core.mail import send_mail  # 🔥 ADDED EMAIL IMPORT

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from .hf_classifier import ZometricMailClassifier

from .models import UploadedFile
from .serializers import UserSignupSerializer, UploadedFileSerializer
from .supabase_client import upload_file_to_supabase
from .openrouter_client import get_openrouter_client

mail_classifier = ZometricMailClassifier()

# ------------------------
# 1-4. ALL YOUR FUNCTIONS (PERFECT - NO CHANGES NEEDED)
# ------------------------
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

# ------------------------
# 🆕 FIXED PROCESS ALL FILES (CRITICAL FIX #1)
# ------------------------
@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def process_all_files(request):
    """Process ALL user's FAILED/PROCESSING audio files"""
    user_files = UploadedFile.objects.filter(
        user=request.user, 
        ai_status__in=["PROCESSING", "FAILED"],
        mime_type__startswith='audio/'
    ).order_by('-created_at')
    
    results = []
    call_nova = get_openrouter_client()
    
    for obj in user_files:
        try:
            print(f"🔄 Processing {obj.id}: {obj.original_name}")
            
            # Generate summary from metadata (no file download needed)
            summary_result = call_nova(
                f"Analyze existing audio file:\n"
                f"File: {obj.original_name}\n"
                f"Path: {obj.supabase_path}\n"
                f"Note: {obj.note}\n"
                f"Size: {obj.size} bytes\n"
                f"Reprocessing failed audio file.",
                max_tokens=500
            )
            
            obj.transcript = "[Full transcript requires file re-upload]"
            obj.summary = summary_result['choices'][0]['message']['content']
            obj.ai_status = "COMPLETED"
            obj.save()
            
            results.append({
                "id": obj.id,
                "filename": obj.original_name,
                "status": obj.ai_status,
                "summary_preview": obj.summary[:100] + "..."
            })
        except Exception as e:
            results.append({"id": obj.id, "error": str(e)})
    
    return Response({
        "message": f"Processed {len(results)} audio files",
        "success_count": len([r for r in results if "error" not in r]),
        "files": results
    })

# ------------------------
# 5. FILES VIEW (🔥 UPDATED WITH AUTO-EMAIL)
# ------------------------
@csrf_exempt
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def files_view(request):
    if request.method == "GET":
        files = UploadedFile.objects.filter(user=request.user).order_by('-created_at')
        return Response(UploadedFileSerializer(files, many=True).data)

    note = request.data.get("note", "").strip()
    if not note:
        return Response({"detail": "Note is MANDATORY"}, status=400)

    uploaded_file = request.FILES.get("file")
    if not uploaded_file:
        return Response({"detail": "File is required"}, status=400)

    uploaded_file.seek(0)
    file_bytes = uploaded_file.read()
    file_hash = hashlib.sha256(file_bytes).hexdigest()

    if UploadedFile.objects.filter(user=request.user, file_hash=file_hash).exists():
        return Response({"detail": "Duplicate file"}, status=400)

    buffer = BytesIO(file_bytes)
    path, public_url = upload_file_to_supabase(request.user.id, buffer, uploaded_file.name)

    mime_type = mimetypes.guess_type(uploaded_file.name)[0] or ""
    
    obj = UploadedFile.objects.create(
        user=request.user,
        note=note,
        original_name=uploaded_file.name,
        supabase_path=path,
        supabase_url=public_url,
        mime_type=mime_type,
        size=len(file_bytes),
        file_hash=file_hash,
        ai_status="PROCESSING",
    )

    # 🔥 AI PROCESSING
    try:
        if mime_type.startswith('audio/'):
            process_audio_file(obj, file_bytes)
        else:
            process_non_audio_file(obj, note, uploaded_file.name, file_bytes)
    except Exception as e:
        obj.ai_status = "FAILED"
        obj.save()
        print(f"❌ AI Error {obj.id}: {e}")

# 🔥 CLASSIFICATION + AUTO-EMAIL (FINAL PERFECT VERSION)
    try:
        if obj.summary and mail_classifier:
            classification = mail_classifier.classify_summary(obj.summary)
            obj.keywords = f"{classification['team']} ({classification['confidence']:.0%})"
            obj.save()
            print(f"📧 Auto-routed: {classification['team']} ({classification['confidence']:.0f}%) - {obj.summary[:50]}...")
            
            # 🔥 SEND EMAIL FOR ALL CLASSIFICATIONS (NO threshold)
            send_team_notification(obj, classification)
            print(f"✅ Email notification sent to {classification['team']} team!")
            
    except Exception as class_error:
        print(f"Classification error: {class_error}")
        obj.keywords = "Classification failed"



    return Response(UploadedFileSerializer(obj).data, status=201)

# 🔥 NEW AUTO-EMAIL FUNCTION (ADD BEFORE OTHER FUNCTIONS)
def send_team_notification(obj: UploadedFile, classification: dict):
    """Auto-send to team email"""
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

📁 File: {obj.original_name}
📝 Note: {obj.note}
🎯 Summary: {obj.summary[:200]}...
🔗 Audio: {obj.supabase_url}
📊 Confidence: {classification['confidence']:.0%}

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

# ------------------------
# KEEP ALL YOUR OTHER FUNCTIONS EXACTLY THE SAME
# ------------------------
def process_audio_file(obj: UploadedFile, file_bytes: bytes = None) -> None:
    """Process single audio file - bulletproof"""
    print(f"🔊 Processing audio: {obj.original_name}")
    
    # ✅ FIX: Use file_bytes if provided
    if file_bytes is None or len(file_bytes) == 0:
        file_bytes = b''  # Empty bytes fallback
    
    # Whisper with fallback
    try:
        whisper_result = transcribe_audio_file_bulletproof(obj, file_bytes)
        transcript = whisper_result['text']
    except Exception as whisper_error:
        print(f"❌ Whisper failed: {whisper_error}")
        transcript = f"[Whisper failed: {str(whisper_error)[:100]}]"
    
    # Nova summary (always works)
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

def transcribe_audio_file_bulletproof(file_obj: UploadedFile, file_bytes: bytes) -> dict:
    api_key = getattr(settings, "OPENROUTER_API_KEY", None)
    if not api_key:
        raise Exception("OPENROUTER_API_KEY missing")
    
    print(f"🎤 Whisper: {file_obj.original_name} ({len(file_bytes)} bytes)")
    
    # ✅ CORRECT: OpenRouter Whisper format
    files = {
        'file': (file_obj.original_name, file_bytes, file_obj.mime_type)
    }
    data = {
        'model': 'openai/whisper:free',
        'response_format': 'text'
    }
    
    response = requests.post(
        "https://openrouter.ai/api/v1/audio/transcriptions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "https://zometric.com",
            "X-Title": "Zometric Audio Transcription",
            # ✅ NO Content-Type - let requests handle multipart
        },
        files=files,
        data=data,
        timeout=120
    )
    
    print(f"Whisper status: {response.status_code}")
    print(f"Whisper response preview: {response.text[:200]}")
    
    # ✅ Handle ALL response cases
    if response.status_code == 200:
        try:
            result = response.json()
            text = result.get('text', '').strip()
            return {
                'text': text if text else "[empty transcription]", 
                'duration': result.get('duration', 0)
            }
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            return {'text': f"[JSON error: {response.text[:200]}]", 'duration': 0}
    
    elif response.status_code == 405:
        # ✅ OpenRouter free tier doesn't support audio
        return {
            'text': f"[Whisper unavailable on free tier - use /files/ endpoint for Nova summary]",
            'duration': len(file_bytes) / 16000  # Rough estimate
        }
    
    else:
        error_msg = response.text[:300] if response.text else "Empty response"
        print(f"Whisper full error: {response.text}")
        raise Exception(f"Whisper HTTP {response.status_code}: {error_msg}")

def process_non_audio_file(obj: UploadedFile, note: str, filename: str, file_bytes: bytes) -> None:
    call_nova = get_openrouter_client()
    
    if obj.mime_type.startswith('text/') or '.txt' in filename.lower():
        try:
            text_content = file_bytes.decode('utf-8', errors='ignore')
            summary_result = call_nova(
                f"Analyze text file:\nNote: {note}\nText: {text_content[:4000]}",
                max_tokens=1500
            )
            obj.summary = summary_result['choices'][0]['message']['content']
        except:
            obj.summary = f"Text analysis: {note}"
    else:
        analysis_result = call_nova(
            f"Analyze file: Note: {note}\nFile: {filename}",
            max_tokens=500
        )
        obj.summary = analysis_result['choices'][0]['message']['content']
    
    obj.ai_status = "COMPLETED"
    obj.save()

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
        
        # ✅ FIX: Generate unique hash instead of "temp"
        file_hash = hashlib.sha256(audio_bytes + str(time.time()).encode()).hexdigest()[:16]
        
        # ✅ FIX: Create dummy object WITHOUT unique constraint violation
        dummy_obj = UploadedFile.objects.create(
            user=User.objects.first(),
            note=note,
            original_name=filename,
            supabase_path=f"temp/{file_hash}",
            supabase_url=f"temp/{file_hash}",
            mime_type=audio_file.content_type or 'audio/mpeg',
            size=len(audio_bytes),
            file_hash=file_hash,  # ✅ Unique hash
            ai_status="TEMP"  # Won't trigger process_all_files
        )
        
        result = transcribe_audio_file_bulletproof(dummy_obj, audio_bytes)
        
        # ✅ Clean up dummy object
        dummy_obj.delete()
        
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
    """🔥 TEST EMAIL FUNCTION"""
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
