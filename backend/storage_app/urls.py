from django.urls import path
from . import views

urlpatterns = [
    # AUTH
    path('signup/', views.SignupView.as_view(), name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),

    # FILES
    path('files/', views.files_view, name='files'),
    path('files/<str:group_id>/', views.group_detail, name='group_detail'),

    # PROCESSING
    path('files/process/', views.process_all_files, name='process_all_files'),
    path("files/<int:file_id>/download/", views.download_file_view, name="download_file"),  # 👈 add views.
    
    # # TESTS
    # path('test/nova/', views.test_nova, name='test_nova'),
    # path('test/audio/', views.transcribe_audio, name='test_audio'),
    # path('test/email/', views.test_email, name='test_email'),
]
