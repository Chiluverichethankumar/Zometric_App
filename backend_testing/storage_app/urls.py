# D:\zometric\app\Zometric_AI_App\backend\storage_app\urls.py (Example)

from django.urls import path
from .views import (
    SignupView, login_view, logout_view, profile_view, 
    files_view, group_detail, download_file_view, file_delete_view
)

urlpatterns = [
    # AUTH ENDPOINTS (1-4)
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('profile/', profile_view, name='profile'),
    
    # FILE MANAGEMENT ENDPOINTS (5-8)
    # 5 & 6. List groups (GET) or Upload files (POST)
    path('files/', files_view, name='files-list-upload'), 
    
    # 6 & 8. Get/Delete Group Detail
    path('files/<str:group_id>/', group_detail, name='group-detail-delete'), 
    
    # 7. Download File
    path('files/<int:file_id>/download/', download_file_view, name='file-download'), 
    
    # 8. Delete Single File
    path('files/<str:full_id_str>/delete/', file_delete_view, name='file_delete_view'),
]