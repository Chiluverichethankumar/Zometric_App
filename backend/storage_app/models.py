from django.db import models
from django.contrib.auth.models import User
from supabase import create_client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_BUCKET_NAME = os.getenv("SUPABASE_BUCKET_NAME", "user-files")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


class UploadedFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="files")
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
        ordering = ["-created_at"]
        unique_together = ("user", "file_hash")

    def __str__(self):
        return f"{self.user.username} - {self.original_name}"

    def delete(self, using=None, keep_parents=False):
        try:
            supabase.storage.from_(SUPABASE_BUCKET_NAME).remove([self.supabase_path])
        except Exception as e:
            print("❌ Supabase deletion failed:", e)

        return super().delete(using=using, keep_parents=keep_parents)
