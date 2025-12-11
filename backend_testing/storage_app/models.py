# D:\zometric\app\Zometric_AI_App\backend\storage_app\models.py

from django.db import models
from django.contrib.auth.models import User
from supabase import create_client
import os

# --- Supabase Setup ---
# ✅ CORRECT: Use os.getenv directly here, outside of Django settings scope.
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_BUCKET_NAME = os.getenv("SUPABASE_BUCKET_NAME", "Zometric")

# Initialize Supabase client
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
else:
    # Fallback/Warning if env vars are missing
    class DummyClient:
        storage = None
    supabase = DummyClient()
    print("WARNING: Supabase client not fully initialized in models.py (Env vars missing).")

class FileGroup(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="file_groups")
    group_id = models.CharField(max_length=20, unique=True)
    note = models.TextField()
    total_files = models.PositiveIntegerField(default=0)
    ai_status = models.CharField(max_length=20, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=['user', 'group_id'], name='unique_user_group')
        ]

    def __str__(self):
        return f"Group {self.group_id} - {self.user.username}"


class UploadedFile(models.Model):
    group = models.ForeignKey(FileGroup, on_delete=models.CASCADE, related_name="files")
    sub_id = models.CharField(max_length=10)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    note = models.TextField()
    original_name = models.CharField(max_length=255)
    supabase_path = models.CharField(max_length=512)
    supabase_url = models.TextField()
    mime_type = models.CharField(max_length=128, blank=True)
    size = models.PositiveBigIntegerField()
    file_hash = models.CharField(max_length=64)
    transcript = models.TextField(blank=True)
    summary = models.TextField(blank=True)
    keywords = models.TextField(blank=True)
    ai_status = models.CharField(max_length=20, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        unique_together = ("user", "file_hash")

    def __str__(self):
        return f"{self.group.group_id}.{self.sub_id} - {self.original_name}"

    def delete(self, using=None, keep_parents=False):
        if supabase.storage:
            try:
                # Use SUPABASE_BUCKET_NAME from the module scope
                supabase.storage.from_(SUPABASE_BUCKET_NAME).remove([self.supabase_path])
            except Exception as e:
                print("❌ Supabase deletion failed:", e)
        return super().delete(using=using, keep_parents=False)