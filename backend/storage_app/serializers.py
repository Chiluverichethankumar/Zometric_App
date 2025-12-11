from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UploadedFile, FileGroup

class UploadedFileSerializer(serializers.ModelSerializer):
    group_id = serializers.CharField(source='group.group_id', read_only=True)
    full_id = serializers.SerializerMethodField()
    
    class Meta:
        model = UploadedFile
        fields = [
            'id', 'group_id', 'sub_id', 'full_id', 'user', 'note', 'original_name', 
            'supabase_url', 'mime_type', 'size', 'ai_status', 'keywords', 
            'summary', 'transcript', 'created_at', 'file_hash'
        ]
        read_only_fields = ['user', 'group', 'file_hash', 'created_at']

    def get_full_id(self, obj):
        return f"{obj.group.group_id}.{obj.sub_id}"

class FileGroupSerializer(serializers.ModelSerializer):
    files = UploadedFileSerializer(many=True, read_only=True)
    file_count = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = FileGroup
        fields = [
            'id', 'group_id', 'user', 'user_id', 'note', 'total_files', 
            'ai_status', 'created_at', 'files', 'file_count'
        ]
        read_only_fields = ['user', 'created_at']

    def get_file_count(self, obj):
        return obj.files.count()

class UserSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "password", "email")
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=validated_data.get("email"),
        )
