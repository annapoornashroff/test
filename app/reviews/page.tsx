'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Heart, Star, Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useReviews } from '@/lib/hooks/useReviews';
import { ReviewCard } from '@/components/ui/review-card';
import { ReviewStats } from '@/components/ui/review-stats';
import { RatingFilter } from '@/components/ui/rating-filter';
import { type ReviewResponse } from '@/lib/types/api';
import { ApiErrorBoundary } from '@/components/ui/api-error-boundary';

export default function ReviewsPage() {
  const { 
    reviews, 
    businessRating, 
    reviewStats, 
    loading, 
    error, 
    hasMore,
    loadMore,
    refreshReviews 
  } = useReviews(10);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  
  // Check if IntersectionObserver is supported
  useEffect(() => {
    setUseInfiniteScroll('IntersectionObserver' in window);
  }, []);

  const lastReviewRef = useCallback((node: HTMLDivElement | null) => {
    if (!useInfiniteScroll || loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore, useInfiniteScroll]);

  // Filter reviews based on search query and rating filter
  const filteredReviews = reviews.filter((review: ReviewResponse) => {
    const matchesSearch = searchQuery === '' || 
      review.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.author_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRating = ratingFilter === null || review.rating === ratingFilter;
    
    return matchesSearch && matchesRating;
  });

  return (
    <ApiErrorBoundary 
      onReset={refreshReviews}
      errorMessage={error || undefined}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-bold text-gold">Forever & Co.</h1>
                  <p className="text-xs text-gold-600 uppercase tracking-wider">Your One-Stop Wedding Wonderland</p>
                </div>
              </Link>

              <div className="flex items-center space-x-4">
                <Link href="/vendors">
                  <Button variant="outline" size="sm" className="rounded-full">
                    Browse Vendors
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button variant="gold" size="sm" className="rounded-full">
                    Cart
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Customer Reviews
            </h2>
            <p className="text-gray-600">
              See what our happy couples are saying about their experience
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Rating Filter */}
              <RatingFilter
                value={ratingFilter}
                onChange={setRatingFilter}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Reviews List */}
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold mb-4">
                {filteredReviews.length} Reviews
                {ratingFilter !== null && ` with ${ratingFilter} stars`}
                {searchQuery && ` matching "${searchQuery}"`}
              </h3>

              {loading && reviews.length === 0 ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : filteredReviews.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
                    <Button 
                      onClick={() => {
                        setSearchQuery('');
                        setRatingFilter(null);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filteredReviews.map((review, index) => (
                    <div
                      key={review.id}
                      ref={index === filteredReviews.length - 1 ? lastReviewRef : null}
                    >
                      <ReviewCard review={review} />
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-center py-4">
                      <LoadingSpinner size="md" />
                    </div>
                  )}
                  {!useInfiniteScroll && hasMore && !loading && (
                    <div className="flex justify-center py-4">
                      <Button 
                        onClick={loadMore}
                        variant="outline"
                        className="w-full max-w-xs"
                      >
                        Load More Reviews
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Review Stats */}
              {reviewStats && (
                <ReviewStats stats={reviewStats} />
              )}

              {/* Write a Review */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Share Your Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    We&apos;d love to hear about your experience with us
                  </p>
                  <a 
                    href="https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full">
                      Write a Review
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ApiErrorBoundary>
  );
}