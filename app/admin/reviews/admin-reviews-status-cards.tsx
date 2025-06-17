'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { GoogleReviewsBadge } from '@/components/ui/google-reviews-badge';
import {
  RefreshCw, ExternalLink, AlertTriangle, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { type BusinessRating, type ReviewStats as ReviewStatsType, type ReviewResponse } from '@/lib/types/api';
import { ReviewStats } from '@/components/ui/review-stats';

interface AdminReviewsStatusCardsProps {
  businessRating: BusinessRating | null;
  reviewStats: ReviewStatsType | null;
  reviews: ReviewResponse[];
  loading: boolean;
  refreshReviews: () => Promise<void>;
  healthStatus: any; // Ideally, define a more specific type for healthStatus
  healthLoading: boolean;
  healthError: string;
  checkReviewsHealth: () => Promise<void>;
}

export default function AdminReviewsStatusCards({
  businessRating,
  reviewStats,
  reviews,
  loading,
  refreshReviews,
  healthStatus,
  healthLoading,
  healthError,
  checkReviewsHealth,
}: AdminReviewsStatusCardsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {/* API Status */}
      <Card className={`${healthStatus?.status === 'healthy' ? 'border-green-500' : 'border-red-500'} border-2`}>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            {healthStatus?.status === 'healthy' ? (
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            )}
            API Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : healthError ? (
            <div className="text-red-500 text-sm">{healthError}</div>
          ) : healthStatus ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Status:</div>
                <div className="font-medium">
                  {healthStatus.status === 'healthy' ? 'Healthy' : 'Error'}
                </div>
                
                <div className="text-gray-500">API Configured:</div>
                <div className="font-medium">
                  {healthStatus.google_api_configured ? 'Yes' : 'No'}
                </div>
                
                <div className="text-gray-500">Data Source:</div>
                <div className="font-medium">
                  {healthStatus.data_source === 'google_places' ? 'Google Places API' : 'Mock Data'}
                </div>
                
                <div className="text-gray-500">Last Updated:</div>
                <div className="font-medium">
                  {healthStatus.timestamp ? new Date(healthStatus.timestamp).toLocaleString() : 'Unknown'}
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkReviewsHealth}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">No status available</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkReviewsHealth}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Business Rating</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : businessRating ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <GoogleReviewsBadge 
                  rating={businessRating.rating} 
                  totalReviews={businessRating.total_reviews}
                  businessName={businessRating.business_name}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Rating:</div>
                <div className="font-medium">{businessRating.rating.toFixed(1)}</div>
                
                <div className="text-gray-500">Total Reviews:</div>
                <div className="font-medium">{businessRating.total_reviews.toLocaleString()}</div>
                
                <div className="text-gray-500">Business Name:</div>
                <div className="font-medium">{businessRating.business_name}</div>
                
                <div className="text-gray-500">Data Source:</div>
                <div className="font-medium">
                  {businessRating.source === 'google_places' ? 'Google Places API' : 'Mock Data'}
                </div>
              </div>
              
              <a 
                href={`https://search.google.com/local/reviews?placeid=${healthStatus?.place_id || ''}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Google
                </Button>
              </a>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">No rating data available</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshReviews}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : reviewStats && reviews.length > 0 ? (
            <ReviewStats 
              stats={reviewStats}
            />
          ) : (
            <div className="text-center py-4 text-gray-500">
              No review statistics available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 