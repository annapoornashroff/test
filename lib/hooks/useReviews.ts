'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  image?: string;
  wedding_date: string;
  created_at: string;
  source: string;
  relative_time?: string;
  is_wedding_related?: boolean;
}

interface BusinessRating {
  rating: number;
  total_reviews: number;
  business_name: string;
  source: string;
  place_id?: string;
}

interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  recent_reviews_count: number;
  wedding_related_count: number;
  rating_distribution: Record<number, number>;
  source: string;
  business_name: string;
  last_updated: string;
}

interface UseReviewsReturn {
  reviews: Review[];
  featuredReviews: Review[];
  businessRating: BusinessRating | null;
  reviewStats: ReviewStats | null;
  loading: boolean;
  error: string | null;
  refreshReviews: () => Promise<void>;
}

export function useReviews(limit: number = 6): UseReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);
  const [businessRating, setBusinessRating] = useState<BusinessRating | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [reviewsData, featuredData, ratingData, statsData] = await Promise.all([
        apiClient.getReviews(limit),
        apiClient.getFeaturedReviews(),
        apiClient.getBusinessRating(),
        apiClient.getReviewStats()
      ]);
      
      setReviews(reviewsData as Review[]);
      setFeaturedReviews(featuredData as Review[]);
      setBusinessRating(ratingData as BusinessRating);
      setReviewStats(statsData as ReviewStats);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      setError(error.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [limit]);

  return {
    reviews,
    featuredReviews,
    businessRating,
    reviewStats,
    loading,
    error,
    refreshReviews: fetchReviews
  };
}