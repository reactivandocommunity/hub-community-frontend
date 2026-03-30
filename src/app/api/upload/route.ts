import { NextRequest, NextResponse } from 'next/server';

const MANAGER_URL = process.env.MANAGER_URL || 'https://manager.hubcommunity.io';
const MANAGER_TOKEN = process.env.MANAGER_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Forward the upload to Strapi
    // If refId, ref, and field are included, Strapi links the file automatically
    const uploadResponse = await fetch(`${MANAGER_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MANAGER_TOKEN}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Strapi upload error:', errorText);
      return NextResponse.json(
        { error: `Upload failed: ${errorText}` },
        { status: uploadResponse.status }
      );
    }

    const uploadedFiles = await uploadResponse.json();
    return NextResponse.json(uploadedFiles);
  } catch (error: any) {
    console.error('Upload proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
