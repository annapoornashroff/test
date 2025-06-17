'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { ReviewStats } from '@/components/ui/review-stats';
import { GoogleReviewsBadge } from '@/components/ui/google-reviews-badge';
import { 
  Heart, Star, RefreshCw, Settings, 
  ExternalLink, AlertTriangle, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useReviews } from '@/lib/hooks/useReviews';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { type ReviewResponse } from '@/lib/types/api';
import Image from 'next/image';
import { ReviewCard } from '@/components/ui/review-card';
import AdminReviewsHeader from './admin-reviews-header';
import AdminReviewsPageHeader from './admin-reviews-page-header';
import AdminReviewsStatusCards from './admin-reviews-status-cards';
import AdminReviewsListSection from './admin-reviews-list-section';

export default function ReviewsClient() {
  const { reviews, businessRating, reviewStats, loading, error, refreshReviews } = useReviews(10);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState('');

  const { user } = useAuth();
  useProtectedRoute();

  useEffect(() => {
    checkReviewsHealth();
  }, []);

  const checkReviewsHealth = async () => {
    try {
      setHealthLoading(true);
      setHealthError('');
      
      const response = await fetch('/api/reviews/health');
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const data = await response.json();
      setHealthStatus(data);
    } catch (error: any) {
      console.error('Error checking reviews health:', error);
      setHealthError(error.message || 'Failed to check reviews service health');
    } finally {
      setHealthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminReviewsHeader />

      <div className="container mx-auto px-6 py-8">
        <AdminReviewsPageHeader />

        {error && (
          <ErrorMessage message={error} className="mb-6" />
        )}

        <AdminReviewsStatusCards 
          businessRating={businessRating}
          reviewStats={reviewStats}
          reviews={reviews}
          loading={loading}
          refreshReviews={refreshReviews}
          healthStatus={healthStatus}
          healthLoading={healthLoading}
          healthError={healthError}
          checkReviewsHealth={checkReviewsHealth}
        />

        <AdminReviewsListSection 
          reviews={reviews}
          loading={loading}
          refreshReviews={refreshReviews}
        />

        {/* Settings Button */}
        <div className="mt-8 text-center">
          <Link href="/admin/reviews/settings">
            <Button variant="outline" size="lg">
              <Settings className="w-5 h-5 mr-2" />
              Configure Reviews Integration
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 