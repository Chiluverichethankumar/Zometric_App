from django.urls import path
from . import views

urlpatterns = [
    path('auth/signup/', views.SignupView.as_view(), name='signup'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/profile/', views.profile_view, name='profile'),
    path('files/', views.files_view, name='files'),
    path('api/test-nova/', views.test_nova, name='test_nova'),
    path('api/transcribe-audio/', views.transcribe_audio, name='transcribe_audio'),
    path('api/process-all-files/', views.process_all_files, name='process_all_files'),
    path('test-email/', views.test_email, name='test_email'),  # ✅ FIXED!
]
