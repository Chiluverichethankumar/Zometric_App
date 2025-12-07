import os
import uuid
import mimetypes
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_BUCKET_NAME = os.getenv("SUPABASE_BUCKET_NAME", "user-files")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def upload_file_to_supabase(user_id: int, file_obj, original_name: str) -> tuple[str, str]:
    """
    Upload file to Supabase and return (path, public_url).
    """
    ext = original_name.split(".")[-1] if "." in original_name else ""
    unique_name = f"{uuid.uuid4().hex}_{original_name}"
    path = f"user_{user_id}/{unique_name}"

    content = file_obj.read()
    mime_type, _ = mimetypes.guess_type(original_name)

    # upload
    res = supabase.storage.from_(SUPABASE_BUCKET_NAME).upload(
        path, content, {"content-type": mime_type or "application/octet-stream"}
    )

    # generate public URL (bucket must be public OR use signed url)
    public_url = supabase.storage.from_(SUPABASE_BUCKET_NAME).get_public_url(path)
    return path, public_url
