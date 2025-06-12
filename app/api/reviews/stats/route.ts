import { NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types/ui';
import { ReviewStats } from '@/lib/types/api';

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
    
    // Validate required fields
    if (!data.total_reviews || typeof data.average_rating !== 'number') {
      throw new Error('Invalid response format: required stats fields are missing');
    }
    
    const apiResponse: ApiResponse<ReviewStats> = {
      data,
      message: 'Review stats fetched successfully',
      status: 200,
      success: true
    };
    
    return NextResponse.json(apiResponse);
  } catch (error: any) {
    console.error('Review stats API error:', error);
    const errorResponse: ApiResponse<null> = {
      data: null,
      message: error.message || 'Failed to fetch review statistics',
      status: 500,
      success: false
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}