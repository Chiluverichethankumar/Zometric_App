# D:\zometric\app\Zometric_AI_App\backend\storage_app\views.py

import os
import traceback
import hashlib
from io import BytesIO
import time
import mimetypes

from django.http import JsonResponse, FileResponse, Http404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User, AnonymousUser
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import UploadedFile, FileGroup, supabase, SUPABASE_BUCKET_NAME
from .serializers import UserSignupSerializer, UploadedFileSerializer, FileGroupSerializer
from .supabase_client import upload_file_to_supabase # We need this for the upload logic


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


# --- FILE MANAGEMENT ENDPOINTS ---

@csrf_exempt
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def files_view(request):
    """
    5. /files/
    GET: List all file groups for the user.
    POST: Upload multiple files, create a FileGroup, and store files on Supabase.
    """
    if request.method == "GET":
        # 6. /files/ - List Groups
        groups = FileGroup.objects.filter(user=request.user).order_by('-created_at')
        return Response(FileGroupSerializer(groups, many=True).data)

    # --- POST: Upload Logic ---
    files = request.FILES.getlist("files")
    note = request.data.get("note", "").strip()
    
    if not note:
        return Response({"detail": "Note is MANDATORY"}, status=400)
    if not files:
        return Response({"detail": "Files are required"}, status=400)

    # STEP 1: PERFECT DUPLICATE CHECK
    file_bytes_list = []
    duplicate_files = []
    
    for uploaded_file in files:
        uploaded_file.seek(0)
        file_bytes = uploaded_file.read()
        uploaded_file.seek(0)  # Reset pointer for subsequent reads (like upload)
        file_hash = hashlib.sha256(file_bytes).hexdigest()
        
        # Check if hash already exists for this user
        existing = UploadedFile.objects.filter(user=request.user, file_hash=file_hash).exists()
        
        if existing:
            duplicate_files.append(uploaded_file.name)
        file_bytes_list.append((uploaded_file, file_bytes))
    
    # Block upload if duplicates are found
    if duplicate_files:
        return Response({
            "error": "🚫 UPLOAD BLOCKED - DUPLICATE FILES",
            "duplicates": duplicate_files,
            "message": f"Files '{', '.join(duplicate_files)}' already exist. Remove or rename before uploading.",
        }, status=status.HTTP_409_CONFLICT)

    # STEP 2: Create Group
    user_groups_count = FileGroup.objects.filter(user=request.user).count()
    timestamp = int(time.time())
    group_id = f"G{request.user.id}-{user_groups_count + 1}-{timestamp % 10000}"
    
    # Simple retry mechanism for unique group_id (though unlikely needed here)
    while FileGroup.objects.filter(group_id=group_id).exists():
        timestamp += 1
        group_id = f"G{request.user.id}-{user_groups_count + 1}-{timestamp % 10000}"
    
    group = FileGroup.objects.create(
        user=request.user,
        group_id=group_id,
        note=note,
        total_files=len(files),
        ai_status="PENDING" # Initial status for the group
    )

    # STEP 3: Upload Files to Supabase and save to DB
    results = []
    for index, (uploaded_file, file_bytes) in enumerate(file_bytes_list, 1):
        try:
            file_hash = hashlib.sha256(file_bytes).hexdigest()
            sub_id = str(index)

            # Use BytesIO buffer for upload to ensure re-reading works correctly
            buffer = BytesIO(file_bytes)
            path, public_url = upload_file_to_supabase(request.user.id, buffer, uploaded_file.name)
            mime_type = mimetypes.guess_type(uploaded_file.name)[0] or ""

            # Set initial AI status to PENDING. External worker will pick it up.
            initial_ai_status = "PENDING"
            initial_summary = ""
            
            # Non-audio/video files are "COMPLETED" immediately, with a placeholder summary
            if not mime_type.startswith(('audio/', 'video/')):
                initial_ai_status = "COMPLETED"
                initial_summary = f"📁 {uploaded_file.name}\n📝 {note}"

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
                ai_status=initial_ai_status,
                summary=initial_summary
            )

            results.append(UploadedFileSerializer(obj).data)
            
        except Exception as e:
            # If a file upload fails, we still return the overall status
            print(f"File upload/DB save failed for {uploaded_file.name}: {e}")
            results.append({"filename": uploaded_file.name, "error": str(e)})

    # Update group total files and AI status
    successful_uploads = [r for r in results if 'error' not in r]
    group.total_files = len(successful_uploads)
    
    # Update group status if all files are complete
    if all(r.get('ai_status') == 'COMPLETED' for r in successful_uploads):
        group.ai_status = "COMPLETED"
    elif successful_uploads:
        group.ai_status = "PENDING"
    else:
        # If group is empty due to failures, mark as FAILED
        group.ai_status = "FAILED" 
        
    group.save()

    return Response({
        "message": f"✅ Created Group {group_id} ({len(successful_uploads)}/{len(files)} files successful)",
        "group_id": group_id,
        "results": results
    }, status=status.HTTP_201_CREATED)


@csrf_exempt
@api_view(["GET", "DELETE"]) # Added DELETE functionality
@permission_classes([IsAuthenticated])
def group_detail(request, group_id):
    """6. /files/<str:group_id>/ - Get group details or Delete group"""
    try:
        group = FileGroup.objects.get(user=request.user, group_id=group_id)
    except FileGroup.DoesNotExist:
        return Response({"error": f"Group {group_id} not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        # Get Group Detail
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

    elif request.method == "DELETE":
        # 8. DELETE /files/<str:group_id>/ - Delete Group
        # Deleting the group will cascade to all UploadedFile objects,
        # which will trigger their custom delete() method to remove files from Supabase.
        group_id = group.group_id
        group.delete()
        return Response({"message": f"✅ Group {group_id} and all contained files deleted successfully."}, 
                        status=status.HTTP_204_NO_CONTENT)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def file_delete_view(request, full_id_str):
    """
    DELETE /files/<str:full_id_str>/delete/
    full_id_str example: "G16-4-263.1"
    """
    try:
        # SPLIT GROUP AND SUB ID
        parts = full_id_str.rsplit(".", 1)
        if len(parts) != 2:
            return Response(
                {"error": "Invalid file identifier format. Use groupId.subId"},
                status=status.HTTP_400_BAD_REQUEST
            )

        group_id_part, sub_id_part = parts

        # GET THE FILE OBJECT
        obj = UploadedFile.objects.get(
            user=request.user,
            group__group_id=group_id_part,
            sub_id=sub_id_part,
        )

    except UploadedFile.DoesNotExist:
        return Response(
            {"error": "File not found or unauthorized"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": f"Unexpected error: {e}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Save group before deleting file
    group = obj.group
    original_name = obj.original_name

    # DELETE FILE (includes Supabase deletion)
    obj.delete()

    # COUNT REMAINING FILES
    remaining_files = group.files.count()

    # CASE 1: GROUP IS NOW EMPTY → DELETE GROUP TOO
    if remaining_files == 0:
        group.delete()
        return Response(
            {
                "message": f"File '{original_name}' deleted. "
                           f"Group '{group_id_part}' had no remaining files so it was deleted too."
            },
            status=status.HTTP_200_OK
        )

    # CASE 2: OTHER FILES STILL EXIST → UPDATE COUNT ONLY
    group.total_files = remaining_files
    group.save()

    return Response(
        {"message": f"File '{original_name}' deleted successfully."},
        status=status.HTTP_200_OK
    )


@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_file_view(request, file_id):
    """
    7. /files/<int:file_id>/download/ - Download a single file.
    
    Handles both Authorization: Token header and ?token=<key> query param.
    """

    # 1) If not already authenticated via header, try ?token=<key>
    if isinstance(request.user, AnonymousUser) or not request.user.is_authenticated:
        token_key = request.GET.get("token")
        if token_key:
            try:
                token = Token.objects.get(key=token_key)
                request.user = token.user
            except Token.DoesNotExist:
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
        raise Http404("File not found or unauthorized")

    # 4) Download from Supabase and stream back
    if not supabase.storage:
        return Response({"detail": "Supabase storage is not configured."}, 
                        status=status.HTTP_503_SERVICE_UNAVAILABLE)
                        
    file_bytes = supabase.storage.from_(SUPABASE_BUCKET_NAME).download(obj.supabase_path)
    buffer = BytesIO(file_bytes)

    return FileResponse(
        buffer,
        as_attachment=True,
        filename=obj.original_name,
        content_type=obj.mime_type or "application/octet-stream",
    )