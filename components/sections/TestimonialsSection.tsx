'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Star, Quote, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import Image from 'next/image';
import { ReviewResponse, BusinessRating } from '@/lib/types/api';
import { ApiErrorBoundary } from '@/components/ui/api-error-boundary';
import { ReviewCard } from '@/components/ui/review-card';
import { GoogleReviewsBadge } from '@/components/ui/google-reviews-badge';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';

function TestimonialsSectionContent() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [businessRating, setBusinessRating] = useState<BusinessRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Ensure client-side rendering matches server-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleError = useCallback((error: any) => {
    console.error('Error fetching reviews:', error);
    setError(error?.message || 'Failed to load testimonials');
    setLoading(false);
    if (isClient) {
      toast({
        title: 'Error',
        description: 'Failed to load reviews. Please try again later.',
        variant: 'destructive'
      });
    }
  }, [toast, isClient]);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch featured reviews and business rating
      const [featuredReviews, businessRatingResponse] = await Promise.all([
        apiClient.getFeaturedReviews(),
        apiClient.getBusinessRating()
      ]);
      
      setReviews(featuredReviews);
      setBusinessRating(businessRatingResponse);
      setLoading(false);
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  useEffect(() => {
    // Only fetch reviews when client is ready and auth is not loading
    // This prevents the API calls during the authentication process
    if (isClient && !authLoading) {
      fetchReviews();
    }
  }, [fetchReviews, isClient, authLoading]);

  useEffect(() => {
    if (isClient && reviews.length > 1) {
      const interval = setInterval(() => {
        setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [reviews, isClient]);

  const handlePrevious = () => {
    setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
  };

  const handleReviewClick = (index: number) => {
    setCurrentReviewIndex(index);
  };

  // Show static content during SSR and initial hydration
  if (!isClient || loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              What Our Couples Say
            </h2>
          </div>
          {isClient && (
            <div className="flex justify-center items-center py-12">
              <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              What Our Couples Say
            </h2>
          </div>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchReviews}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            What Our Couples Say
          </h2>
          {businessRating && (
            <div className="flex flex-col items-center justify-center space-y-2">
              <GoogleReviewsBadge
                rating={businessRating.rating}
                totalReviews={businessRating.total_reviews}
                businessName={businessRating.business_name}
              />
              {businessRating.place_id && (
                <a
                  href={`https://www.google.com/maps/place/?q=place_id:${businessRating.place_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm mt-1"
                  aria-label="View on Google"
                >
                  View on Google
                </a>
              )}
            </div>
          )}
        </div>
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className={`transition-all duration-500 ${
                  index === currentReviewIndex
                    ? 'opacity-100 transform scale-100'
                    : 'opacity-0 transform scale-95 absolute'
                }`}
              >
                <ReviewCard
                  review={review}
                  isActive={index === currentReviewIndex}
                />
              </div>
            ))}
          </div>
          {reviews.length > 1 && (
            <div className="flex justify-center mt-8 space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                aria-label="Previous review"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                aria-label="Next review"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function TestimonialsSection() {
  return (
    <ApiErrorBoundary>
      <TestimonialsSectionContent />
    </ApiErrorBoundary>
  );
}