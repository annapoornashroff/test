import { NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types/ui';
import { BusinessRating } from '@/lib/types/api';

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
    
    // Validate required fields
    if (!data.rating || !data.business_name) {
      throw new Error('Invalid response format: required rating fields are missing');
    }
    
    const apiResponse: ApiResponse<BusinessRating> = {
      data,
      message: 'Business rating fetched successfully',
      status: 200,
      success: true
    };
    
    return NextResponse.json(apiResponse);
  } catch (error: any) {
    console.error('Business rating API error:', error);
    const errorResponse: ApiResponse<null> = {
      data: null,
      message: error.message || 'Failed to fetch business rating',
      status: 500,
      success: false
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}