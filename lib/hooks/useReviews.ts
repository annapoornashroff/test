'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/index';
import { ReviewResponse, ReviewsResponse, BusinessRating, ReviewStats } from '@/lib/types/api';

interface UseReviewsReturn {
  reviews: ReviewResponse[];
  featuredReviews: ReviewResponse[];
  businessRating: BusinessRating | null;
  reviewStats: ReviewStats | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalPages: number;
  currentPage: number;
  loadMore: () => Promise<void>;
  refreshReviews: () => Promise<void>;
}

export function useReviews(initialLimit: number = 10): UseReviewsReturn {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState<ReviewResponse[]>([]);
  const [businessRating, setBusinessRating] = useState<BusinessRating | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchReviews = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const [reviewsResponse, featuredData, ratingData, statsData] = await Promise.all([
        apiClient.getReviews({ page: pageNum, limit: initialLimit }),
        apiClient.getFeaturedReviews(),
        apiClient.getBusinessRating(),
        apiClient.getReviewStats()
      ]);
      
      // Update reviews based on whether we're appending or replacing
      setReviews(prev => append ? [...prev, ...reviewsResponse.reviews] : reviewsResponse.reviews);
      setFeaturedReviews(featuredData);
      setBusinessRating(ratingData);
      setReviewStats(statsData);
      
      // Update pagination info
      setTotalPages(reviewsResponse.total_pages);
      setHasMore(pageNum < reviewsResponse.total_pages);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      setError(error.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);

  useEffect(() => {
    fetchReviews(1, false);
  }, [fetchReviews]);

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchReviews(nextPage, true);
    }
  }, [loading, hasMore, page, fetchReviews]);

  return {
    reviews,
    featuredReviews,
    businessRating,
    reviewStats,
    loading,
    error,
    hasMore,
    totalPages,
    currentPage: page,
    loadMore,
    refreshReviews: () => fetchReviews(1, false)
  };
}