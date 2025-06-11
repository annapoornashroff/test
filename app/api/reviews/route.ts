import { NextResponse } from 'next/server';

// This is a proxy endpoint to avoid exposing API keys in the frontend
export const dynamic = 'force-dynamic'; // Explicitly mark as dynamic route
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Validate and sanitize parameters
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.min(50, Math.max(1, limit));
    
    // Get the API URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    
    // Fetch reviews from the backend with pagination
    const response = await fetch(
      `${apiUrl}/reviews?page=${sanitizedPage}&limit=${sanitizedLimit}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching reviews: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('Reviews API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}