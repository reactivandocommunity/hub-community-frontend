import { NextRequest, NextResponse } from 'next/server';

const MANAGER_URL = process.env.MANAGER_URL || process.env.NEXT_PUBLIC_MANAGER_URL || 'https://manager.hubcommunity.io';
const MANAGER_TOKEN = process.env.MANAGER_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Forward the upload to Strapi
    const uploadResponse = await fetch(`${MANAGER_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MANAGER_TOKEN}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
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

// Link uploaded files to an event
export async function PUT(request: NextRequest) {
  try {
    const { eventDocumentId, fileIds } = await request.json();

    if (!eventDocumentId || !fileIds) {
      return NextResponse.json(
        { error: 'eventDocumentId and fileIds are required' },
        { status: 400 }
      );
    }

    // Update the event's images relation in Strapi
    const updateResponse = await fetch(
      `${MANAGER_URL}/api/events/${eventDocumentId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${MANAGER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            images: fileIds,
          },
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      return NextResponse.json(
        { error: `Failed to link images: ${errorText}` },
        { status: updateResponse.status }
      );
    }

    const result = await updateResponse.json();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Link images error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
