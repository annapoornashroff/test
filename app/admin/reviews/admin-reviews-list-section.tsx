'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ReviewCard } from '@/components/ui/review-card';
import { Download, RefreshCw } from 'lucide-react';
import { type ReviewResponse } from '@/lib/types/api';

interface AdminReviewsListSectionProps {
  reviews: ReviewResponse[];
  loading: boolean;
  refreshReviews: () => Promise<void>;
}

export default function AdminReviewsListSection({
  reviews,
  loading,
  refreshReviews,
}: AdminReviewsListSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Reviews ({reviews.length})</CardTitle>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reviews available.
            <Button onClick={refreshReviews} variant="outline" size="sm" className="ml-4">
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: ReviewResponse) => (
              <ReviewCard key={review.id} review={review} showApproval={true} />
            ))}
            <Button onClick={refreshReviews} variant="outline" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" /> Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 