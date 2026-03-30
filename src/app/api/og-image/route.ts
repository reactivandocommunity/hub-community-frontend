import { NextRequest, NextResponse } from 'next/server';

/**
 * OG Image proxy route.
 * Proxies images from the CMS (manager.hubcommunity.io) through the Next.js
 * server so social media crawlers can always access them for link previews.
 *
 * Usage: /api/og-image?url=https://manager.hubcommunity.io/uploads/...
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  // Only allow proxying from trusted domains
  const allowedDomains = ['manager.hubcommunity.io', 'hubcommunity.io'];
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return new NextResponse('Invalid URL', { status: 400 });
  }

  if (!allowedDomains.some(domain => parsedUrl.hostname.endsWith(domain))) {
    return new NextResponse('Domain not allowed', { status: 403 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HubCommunity/1.0)',
        Accept: 'image/*',
      },
    });

    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('OG image proxy error:', error);
    return new NextResponse('Failed to fetch image', { status: 502 });
  }
}
