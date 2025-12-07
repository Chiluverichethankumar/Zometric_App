from django.contrib import admin
from .models import UploadedFile

@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ("user", "original_name", "size", "created_at", "ai_status")
    search_fields = ("user__username", "original_name", "note")

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()  # calls model.delete()
