# storage_app/admin.py

from django.contrib import admin
from django.contrib.auth.models import User
from .models import FileGroup, UploadedFile

# --- Inline for UploadedFile (to be displayed inside FileGroupAdmin) ---

class UploadedFileInline(admin.TabularInline):
    """
    Defines how UploadedFile objects are displayed within the FileGroup detail view.
    """
    model = UploadedFile
    # Fields to show in the inline table
    fields = (
        "sub_id", 
        "original_name", 
        "size_kb", 
        "mime_type", 
        "ai_status",
        "created_at"
    )
    # Fields that should not be editable from the Group view
    readonly_fields = fields 
    # Do not show empty rows for adding new files (uploads are done via API)
    extra = 0
    can_delete = False 
    
    # Custom method to display size in KB
    def size_kb(self, obj):
        if obj.size is not None:
            # Use floating point division for accurate KB display
            return f"{obj.size / 1024:.2f} KB"
        return "N/A"
    size_kb.short_description = 'Size (KB)'


# --- FileGroup Admin Configuration ---

@admin.register(FileGroup)
class FileGroupAdmin(admin.ModelAdmin):
    """
    Admin view for the FileGroup model.
    """
    list_display = (
        "group_id", 
        "user", 
        "note", 
        "total_files", 
        "ai_status", 
        "created_at"
    )
    list_filter = ("ai_status", "created_at", "user")
    search_fields = ("group_id", "note", "user__username")
    
    # These fields are set on creation via the API, so they should be read-only in the Admin
    readonly_fields = ("group_id", "created_at", "total_files")
    
    # Include the related files right on the FileGroup detail page
    inlines = [UploadedFileInline]


# --- UploadedFile Admin Configuration ---

@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    """
    Admin view for the UploadedFile model.
    """
    list_display = (
        "get_full_id", 
        "original_name", 
        "user", 
        "group", 
        "size_kb", 
        "ai_status", 
        "created_at"
    )
    list_filter = ("ai_status", "mime_type", "created_at", "user", "group")
    search_fields = ("original_name", "file_hash", "transcript", "summary")
    
    # Group fields into logical sections on the detail page
    fieldsets = (
        (None, {
            'fields': (
                ('group', 'sub_id'), 
                'user',
                'original_name', 
                'note'
            )
        }),
        ('File Details & Storage', {
            'fields': (
                'mime_type', 
                'size_mb', # Custom read-only field
                'file_hash', 
                ('supabase_path', 'supabase_url')
            ),
            'classes': ('collapse',), # Makes this section collapsible
        }),
        ('AI Processing Details', {
            'fields': (
                'ai_status', 
                'transcript', 
                'summary', 
                'keywords'
            ),
        }),
    )

    # Fields that are automatically set and should not be edited
    readonly_fields = (
        "group", "user", "sub_id", "supabase_path", "supabase_url", 
        "size", "file_hash", "created_at", "size_mb"
    )

    # Custom methods for better display
    def get_full_id(self, obj):
        """Displays the formatted ID (group_id.sub_id)."""
        return f"{obj.group.group_id}.{obj.sub_id}"
    get_full_id.short_description = 'Full ID'

    def size_mb(self, obj):
        """Converts file size from bytes to MB for display."""
        if obj.size is not None:
            # Display size in Megabytes (using 1024*1024)
            return f"{obj.size / (1024 * 1024):.2f} MB"
        return "N/A"
    size_mb.short_description = 'Size (MB)'
    
    def size_kb(self, obj):
        """Converts file size from bytes to KB for use in list_display."""
        if obj.size is not None:
            return f"{obj.size / 1024:.2f} KB"
        return "N/A"
    size_kb.short_description = 'Size (KB)'