import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the API URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    
    // Fetch review stats from the backend
    const response = await fetch(`${apiUrl}/reviews/stats`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching review stats: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Review stats API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch review statistics' },
      { status: 500 }
    );
  }
}