import { NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types/ui';

interface HealthStatus {
  status: 'healthy' | 'error';
  google_api_configured: boolean;
  data_source: string;
  fallback_available: boolean;
}

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
    
    // Validate required fields
    if (!data.status || !data.data_source) {
      throw new Error('Invalid response format: required health check fields are missing');
    }
    
    const apiResponse: ApiResponse<HealthStatus> = {
      data,
      message: 'Health check completed successfully',
      status: 200,
      success: true
    };
    
    return NextResponse.json(apiResponse);
  } catch (error: any) {
    console.error('Reviews health check error:', error);
    const errorResponse: ApiResponse<null> = {
      data: null,
      message: error.message || 'Failed to check reviews service health',
      status: 500,
      success: false
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}