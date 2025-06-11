import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the API URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    
    // Check the health of the reviews service
    const response = await fetch(`${apiUrl}/reviews/health`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error checking reviews service health: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Reviews health check error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error.message || 'Failed to check reviews service health',
        fallback_available: true
      },
      { status: 200 } // Still return 200 to indicate the API itself is working
    );
  }
}