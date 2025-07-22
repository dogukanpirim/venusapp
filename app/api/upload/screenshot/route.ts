
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file received' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const extension = file.name.split('.').pop();
    const filename = `screenshot-${timestamp}-${random}.${extension}`;

    // Save to public/uploads/screenshots directory
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'screenshots');
    const filePath = join(uploadsDir, filename);

    // Create directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    await writeFile(filePath, buffer);

    // Return the URL that can be used to access the file
    const fileUrl = `/uploads/screenshots/${filename}`;

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        filename,
        size: file.size,
        type: file.type
      },
      message: 'Screenshot uploaded successfully'
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload screenshot' 
      },
      { status: 500 }
    );
  }
}
