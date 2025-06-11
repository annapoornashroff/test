'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Heart, Star, Filter, Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useReviews } from '@/lib/hooks/useReviews';
import { ReviewCard } from '@/components/ui/review-card';
import { ReviewStats } from '@/components/ui/review-stats';

export default function ReviewsPage() {
  const { reviews, businessRating, reviewStats, loading, error, refreshReviews } = useReviews(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = !searchQuery || 
      review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRating = ratingFilter === null || review.rating === ratingFilter;
    
    return matchesSearch && matchesRating;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
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

        {error && (
          <ErrorMessage message={error} className="mb-6" />
        )}

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
            <div className="flex space-x-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <button
                  key={rating}
                  onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg border ${
                    ratingFilter === rating 
                      ? 'border-primary bg-primary-50 text-primary' 
                      : 'border-gray-300 hover:border-primary'
                  }`}
                >
                  <Star className={`w-4 h-4 ${ratingFilter === rating ? 'text-primary fill-current' : 'text-gray-400'}`} />
                  <span>{rating}</span>
                </button>
              ))}
              {ratingFilter !== null && (
                <button
                  onClick={() => setRatingFilter(null)}
                  className="px-3 py-2 rounded-lg border border-gray-300 hover:border-primary"
                >
                  Clear
                </button>
              )}
            </div>
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

            {filteredReviews.length === 0 ? (
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
                {filteredReviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rating Summary */}
            {reviewStats && (
              <ReviewStats stats={reviewStats} />
            )}

            {/* Google Reviews Link */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Write a Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Share your experience with Forever & Co. and help other couples plan their perfect wedding.
                </p>
                <a 
                  href={`https://search.google.com/local/writereview?placeid=${businessRating?.place_id || ''}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full"
                >
                  <Button className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Write a Google Review
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}