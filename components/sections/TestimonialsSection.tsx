'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Star, Quote, ExternalLink } from 'lucide-react';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import { type ReviewResponse, type BusinessRating } from '@/lib/types/api';
import { ApiErrorBoundary } from '@/components/ui/api-error-boundary';

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [businessRating, setBusinessRating] = useState<BusinessRating | null>(null);
  const [currentReview, setCurrentReview] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (reviews.length > 0) {
      const interval = setInterval(() =>
        setCurrentReview((prev) => (prev + 1) % Math.min(reviews.length, 5)),
      3000);
      return () => clearInterval(interval);
    }
  }, [reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch featured reviews and business rating in parallel
      const [reviewsData, ratingData] = await Promise.all([
        apiClient.getFeaturedReviews(),
        apiClient.getBusinessRating()
      ]);
      
      setReviews(reviewsData as ReviewResponse[]);
      setBusinessRating(ratingData as BusinessRating);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      setError(error.message || 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <ApiErrorBoundary 
      onReset={fetchReviews}
      errorMessage={error}
    >
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              What Our Couples Say
            </h2>
            {businessRating && (
              <div className="flex items-center justify-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${
                        i < Math.floor(businessRating.rating) 
                          ? 'text-yellow-500 fill-current' 
                          : i < businessRating.rating 
                            ? 'text-yellow-500 fill-current opacity-50' 
                            : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {businessRating.rating.toFixed(1)} ({businessRating.total_reviews.toLocaleString()} reviews)
                </span>
                <a 
                  href={`https://search.google.com/local/reviews?placeid=${businessRating.place_id || ''}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View on Google
                </a>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review, index) => (
                  <Card 
                    key={review.id}
                    className={`transition-all duration-500 ${
                      index === currentReview ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95 absolute'
                    }`}
                  >
                    <CardContent className="p-6">
                      {/* Rating */}
                      <div className="flex items-center space-x-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                        {review.relative_time && (
                          <span className="text-xs text-gray-500 ml-2">
                            {review.relative_time}
                          </span>
                        )}
                      </div>
                      
                      {/* Comment */}
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        &quot;{review.comment}&quot;
                      </p>
                      
                      {/* Wedding Date */}
                      <p className="text-xs text-gray-500">
                        Wedding: {formatDate(review.wedding_date)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center space-x-2 mt-6">
                {[...Array(Math.min(reviews.length, 5))].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentReview(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentReview ? 'bg-primary' : 'bg-primary/30'
                    }`}
                    aria-label={`Go to review ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </ApiErrorBoundary>
  );
}