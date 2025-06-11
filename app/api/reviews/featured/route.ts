import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the API URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    
    // Fetch featured reviews from the backend
    const response = await fetch(`${apiUrl}/reviews/featured`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching featured reviews: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Featured reviews API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch featured reviews' },
      { status: 500 }
    );
  }
}