import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the API URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    
    // Fetch business rating from the backend
    const response = await fetch(`${apiUrl}/reviews/business-rating`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching business rating: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Business rating API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch business rating' },
      { status: 500 }
    );
  }
}