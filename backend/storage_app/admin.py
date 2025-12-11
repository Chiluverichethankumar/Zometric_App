from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import FileGroup, UploadedFile

# 🔥 CONSTANTS
FILE_ICONS = {
    'audio/': '🎵', 'video/': '🎥', 'image/': '🖼️', 
    'text/': '📄', 'application/': '📎', '': '📁'
}
STATUS_COLORS = {
    'COMPLETED': '#28a745', 'PROCESSING': '#ffc107', 
    'FAILED': '#dc3545', 'PENDING': '#6c757d'
}

class UploadedFileInline(admin.TabularInline):
    """🔥 INLINE FILES WITH PREVIEWS in FileGroup"""
    model = UploadedFile
    fields = ['preview_cell', 'original_name', 'ai_status', 'keywords', 'supabase_url']
    readonly_fields = ['preview_cell']
    extra = 0
    ordering = ['sub_id']
    can_delete = False
    
    def preview_cell(self, obj):
        """🔥 IMAGE PREVIEWS + DOWNLOAD LINKS"""
        if obj.mime_type.startswith('image/') and obj.supabase_url:
            return format_html(
                '''
                <div style="display:flex;align-items:center;gap:10px;">
                    <img src="{}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);" />
                    <div>
                        <a href="{}" target="_blank" style="color:#28a745;font-weight:500;">🖼️ View</a> | 
                        <a href="{}" download style="color:#007bff;">💾 Download</a>
                    </div>
                </div>
                ''',
                obj.supabase_url, obj.supabase_url, obj.supabase_url
            )
        elif obj.supabase_url:
            icon = FILE_ICONS.get(obj.mime_type.split('/')[0] + '/', '📎')
            return format_html(
                '''
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:24px;">{}</span>
                    <div>
                        <a href="{}" target="_blank" style="color:#28a745;font-weight:500;">🔗 Open</a> | 
                        <a href="{}" download style="color:#007bff;">💾 Download</a>
                    </div>
                </div>
                ''',
                icon, obj.supabase_url, obj.supabase_url
            )
        return "No file available"
    preview_cell.short_description = 'Preview & Actions'

@admin.register(FileGroup)
class FileGroupAdmin(admin.ModelAdmin):
    list_display = ['group_id_badge', 'user_link', 'file_count_badge', 
                   'status_badge', 'note_preview', 'created_formatted']
    list_filter = ['ai_status', 'created_at', 'user']
    search_fields = ['group_id', 'note', 'user__username']
    list_per_page = 20
    date_hierarchy = 'created_at'
    inlines = [UploadedFileInline]  # 🔥 SHOW ALL FILES HERE
    
    fieldsets = (
        ('📁 Group Information', {
            'fields': ('group_id', 'user', 'note', 'total_files', 'ai_status')
        }),
        ('📊 Files Preview', {
            'fields': ('files_thumbnails',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['files_thumbnails']
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('files__group')
    
    def files_thumbnails(self, obj):
        """🔥 THUMBNAIL GALLERY in collapsed section"""
        html = []
        for file_obj in obj.files.all()[:8]:  # First 8 files
            if file_obj.mime_type.startswith('image/'):
                html.append(format_html(
                    '<a href="{}" target="_blank">'
                    '<img src="{}" title="{}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;margin:2px;cursor:pointer;border:2px solid #e9ecef;" />'
                    '</a>',
                    file_obj.supabase_url, file_obj.supabase_url, file_obj.original_name
                ))
            else:
                icon = FILE_ICONS.get(file_obj.mime_type.split('/')[0] + '/', '📎')
                html.append(format_html(
                    '<span title="{}" style="font-size:20px;margin:5px;display:inline-block;width:50px;height:50px;line-height:50px;text-align:center;border:2px solid #e9ecef;border-radius:6px;background:#f8f9fa;">{}</span>',
                    file_obj.original_name, icon
                ))
        
        return format_html(
            '<div style="display:flex;flex-wrap:wrap;gap:5px;max-width:500px;">{}</div>'
            '<p style="margin-top:10px;color:#666;"><strong>{}</strong> total files | '
            '<a href="{}" style="color:#007bff;">View All Files →</a></p>',
            ''.join(html), 
            obj.files.count(),
            reverse('admin:storage_app_uploadedfile_changelist') + f'?group__id__exact={obj.id}'
        )
    files_thumbnails.short_description = 'Files Gallery'
    files_thumbnails.allow_tags = True
    
    # 🔥 LIST DISPLAY
    def group_id_badge(self, obj):
        return format_html(
            '<span style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:8px 16px;border-radius:25px;font-weight:bold;font-size:14px;box-shadow:0 2px 10px rgba(102,126,234,0.3);">Group {}</span>',
            obj.group_id
        )
    group_id_badge.short_description = 'Group ID'
    
    def user_link(self, obj):
        url = reverse('admin:auth_user_change', args=[obj.user.id])
        return format_html(
            '<a href="{}" style="color:#495057;font-weight:500;text-decoration:none;">{}</a>',
            url, obj.user.username
        )
    user_link.short_description = 'Owner'
    
    def file_count_badge(self, obj):
        return format_html(
            '<span style="background:linear-gradient(135deg,#11998e,#38ef7d);color:white;padding:6px 12px;border-radius:20px;font-weight:bold;box-shadow:0 2px 8px rgba(17,153,142,0.3);">{} files</span>',
            obj.files.count()
        )
    file_count_badge.short_description = 'Files'
    
    def status_badge(self, obj):
        color = STATUS_COLORS.get(obj.ai_status, '#6c757d')
        return format_html(
            '<span style="background:{};color:white;padding:5px 10px;border-radius:15px;font-size:12px;font-weight:500;box-shadow:0 2px 6px rgba(0,0,0,0.1);">● {}</span>',
            color, obj.ai_status
        )
    status_badge.short_description = 'Status'
    
    def note_preview(self, obj):
        preview = obj.note[:60]
        return format_html(
            '<span title="{}">{}</span>',
            obj.note, preview + ('...' if len(obj.note) > 60 else '')
        )
    note_preview.short_description = 'Note'
    
    def created_formatted(self, obj):
        return obj.created_at.strftime('%m/%d %H:%M')
    created_formatted.short_description = 'Created'
    
    # 🔥 BULK ACTIONS
    actions = ['resend_all_group_emails', 'mark_groups_completed']
    
    @admin.action(description="📧 Resend ALL team emails for selected groups")
    def resend_all_group_emails(self, request, queryset):
        total_emails = 0
        for group in queryset:
            for file_obj in group.files.filter(summary__isnull=False, ai_status='COMPLETED'):
                try:
                    from .views import send_team_notification
                    from .hf_classifier import ZometricMailClassifier
                    classifier = ZometricMailClassifier()
                    classification = classifier.classify_summary(file_obj.summary)
                    send_team_notification(file_obj, classification)
                    total_emails += 1
                except Exception:
                    pass
        self.message_user(request, f'Successfully resent {total_emails} team emails')
    
    @admin.action(description="✅ Mark all groups COMPLETED")
    def mark_groups_completed(self, request, queryset):
        updated = queryset.update(ai_status='COMPLETED')
        self.message_user(request, f'Marked {updated} groups as COMPLETED')

@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ['full_id_badge', 'group_link', 'file_link', 
                   'file_type_icon', 'size_formatted', 'status_badge', 
                   'team_badge', 'created_formatted']
    list_filter = ['ai_status', 'mime_type', 'group', 'user', 'created_at']
    search_fields = ['original_name', 'group__group_id', 'note', 'keywords', 'summary']
    list_per_page = 50
    date_hierarchy = 'created_at'
    list_select_related = ['group', 'user']
    
    fieldsets = (
        ('📁 Identification', {
            'fields': ('full_id_display', 'group', 'sub_id'),
            'classes': ('wide',)
        }),
        ('📄 File Details', {
            'fields': ('original_name', 'note', 'mime_type', 'size'),
        }),
        ('🤖 AI Processing', {
            'fields': ('ai_status', 'summary', 'keywords', 'transcript'),
            'classes': ('collapse',)
        }),
        ('🔗 Storage & Preview', {
            'fields': ('supabase_url', 'file_preview', 'supabase_path'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['full_id_display', 'file_preview']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('group', 'user')
    
    def full_id_badge(self, obj):
        return format_html(
            '<span style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:8px 14px;border-radius:25px;font-weight:bold;font-size:13px;box-shadow:0 2px 10px rgba(102,126,234,0.3);">File {}.{}</span>',
            obj.group.group_id, obj.sub_id
        )
    full_id_badge.short_description = 'File ID'
    
    def group_link(self, obj):
        url = reverse('admin:storage_app_filegroup_change', args=[obj.group.id])
        return format_html(
            '<a href="{}" style="color:#007bff;font-weight:600;">Group {}</a>',
            url, obj.group.group_id
        )
    group_link.short_description = 'Group'
    
    def file_link(self, obj):
        if obj.supabase_url:
            return format_html(
                '<a href="{}" target="_blank" style="color:#28a745;">{}</a>',
                obj.supabase_url, obj.original_name[:35] + ('...' if len(obj.original_name) > 35 else '')
            )
        return obj.original_name[:35]
    file_link.short_description = 'File Name'
    
    def file_type_icon(self, obj):
        icon_key = obj.mime_type.split('/')[0] + '/' if '/' in obj.mime_type else ''
        icon = FILE_ICONS.get(icon_key, '📎')
        return format_html('<span title="{}" style="font-size:18px;">{}</span>', obj.mime_type or 'unknown', icon)
    file_type_icon.short_description = 'Type'
    
    def size_formatted(self, obj):
        size = obj.size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    size_formatted.short_description = 'Size'
    
    def status_badge(self, obj):
        color = STATUS_COLORS.get(obj.ai_status, '#6c757d')
        return format_html(
            '<span style="background:{};color:white;padding:4px 10px;border-radius:15px;font-size:11px;font-weight:500;">{}</span>',
            color, obj.ai_status
        )
    status_badge.short_description = 'Status'
    
    def team_badge(self, obj):
        if not obj.keywords:
            return format_html('<span style="color:#6c757d;">—</span>')
        team = obj.keywords.split('(')[0].strip()
        return format_html(
            '<span style="background:#17a2b8;color:white;padding:4px 10px;border-radius:15px;font-size:11px;font-weight:500;">{}</span>',
            team
        )
    team_badge.short_description = 'Team'
    
    def created_formatted(self, obj):
        return obj.created_at.strftime('%m/%d %H:%M')
    created_formatted.short_description = 'Date'
    
    def full_id_display(self, obj):
        return f"{obj.group.group_id}.{obj.sub_id}"
    full_id_display.short_description = 'Complete ID'
    
    def file_preview(self, obj):
        if obj.mime_type.startswith('image/') and obj.supabase_url:
            return format_html(
                '''
                <div style="text-align:center;">
                    <img src="{}" style="max-height:250px;max-width:100%;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15);" />
                    <div style="margin-top:10px;">
                        <a href="{}" target="_blank" class="button" style="background:#28a745;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;margin:0 5px;">🖼️ Full View</a>
                        <a href="{}" download class="button" style="background:#007bff;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;">💾 Download</a>
                    </div>
                </div>
                ''',
                obj.supabase_url, obj.supabase_url, obj.supabase_url
            )
        elif obj.supabase_url:
            icon = FILE_ICONS.get(obj.mime_type.split('/')[0] + '/', '📎')
            return format_html(
                '''
                <div style="text-align:center;padding:40px;background:#f8f9fa;border-radius:12px;border:2px dashed #dee2e6;">
                    <div style="font-size:48px;margin-bottom:15px;">{}</div>
                    <h4>{}</h4>
                    <div style="margin-top:15px;">
                        <a href="{}" target="_blank" style="background:#28a745;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;margin:0 5px;">🔗 Open File</a>
                        <a href="{}" download style="background:#007bff;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">💾 Download</a>
                    </div>
                </div>
                ''',
                icon, obj.original_name, obj.supabase_url, obj.supabase_url
            )
        return "No preview available"
    file_preview.short_description = 'File Preview'
    file_preview.allow_tags = True
    
    # 🔥 BULK ACTIONS
    actions = ['resend_team_emails', 'mark_completed', 'mark_failed']
    
    @admin.action(description="📧 Resend team emails")
    def resend_team_emails(self, request, queryset):
        count = 0
        for obj in queryset.filter(summary__isnull=False):
            try:
                from .views import send_team_notification
                from .hf_classifier import ZometricMailClassifier
                classifier = ZometricMailClassifier()
                classification = classifier.classify_summary(obj.summary)
                send_team_notification(obj, classification)
                count += 1
            except Exception:
                pass
        self.message_user(request, f'Resent {count} team emails successfully')
    
    @admin.action(description="✅ Mark as COMPLETED")
    def mark_completed(self, request, queryset):
        count = queryset.update(ai_status='COMPLETED')
        self.message_user(request, f'Marked {count} files as COMPLETED')
    
    @admin.action(description="❌ Mark as FAILED")
    def mark_failed(self, request, queryset):
        count = queryset.update(ai_status='FAILED')
        self.message_user(request, f'Marked {count} files as FAILED')
