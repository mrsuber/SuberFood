import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// POST /api/upload/verification - Upload verification documents (ID card and photo)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const idCard = formData.get('idCard') as File | null;
    const photo = formData.get('photo') as File | null;

    if (!idCard || !photo) {
      return NextResponse.json(
        { error: 'Both ID card and photo are required' },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(idCard.type) || !allowedTypes.includes(photo.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }

    // Validate file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (idCard.size > maxSize || photo.size > maxSize) {
      return NextResponse.json(
        { error: 'Files must be smaller than 5MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'verifications');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filenames
    const timestamp = Date.now();
    const userId = session.user.id;

    const idCardExt = idCard.name.split('.').pop();
    const photoExt = photo.name.split('.').pop();

    const idCardFilename = `${userId}_idcard_${timestamp}.${idCardExt}`;
    const photoFilename = `${userId}_photo_${timestamp}.${photoExt}`;

    // Save files
    const idCardBytes = await idCard.arrayBuffer();
    const photoBytes = await photo.arrayBuffer();

    const idCardPath = join(uploadsDir, idCardFilename);
    const photoPath = join(uploadsDir, photoFilename);

    await writeFile(idCardPath, Buffer.from(idCardBytes));
    await writeFile(photoPath, Buffer.from(photoBytes));

    // Return public URLs
    const idCardUrl = `/uploads/verifications/${idCardFilename}`;
    const photoUrl = `/uploads/verifications/${photoFilename}`;

    return NextResponse.json({
      success: true,
      idCardUrl,
      photoUrl,
      message: 'Files uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
