import { NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types/ui';
import { ReviewResponse } from '@/lib/types/api';

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
    
    // Validate required fields
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected an array of reviews');
    }
    
    const apiResponse: ApiResponse<ReviewResponse[]> = {
      data,
      message: 'Featured reviews fetched successfully',
      status: 200,
      success: true
    };
    
    return NextResponse.json(apiResponse);
  } catch (error: any) {
    console.error('Featured reviews API error:', error);
    const errorResponse: ApiResponse<null> = {
      data: null,
      message: error.message || 'Failed to fetch featured reviews',
      status: 500,
      success: false
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}