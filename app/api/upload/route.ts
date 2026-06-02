import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth-middleware';
import { uploadFile, getPublicFileUrl } from '@/lib/supabase/storage';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 10MB' },
        { status: 400 },
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${random}.${extension}`;
    const filepath = `${folder}/${filename}`;

    // Convert File to Buffer
    const buffer = await file.arrayBuffer();

    // Upload to storage
    const publicUrl = await uploadFile(filepath, Buffer.from(buffer));

    if (!publicUrl) {
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filepath,
      filename,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during upload' },
      { status: 500 },
    );
  }
}
