'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Star, Quote, ExternalLink } from 'lucide-react';
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
}

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
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
      
      setReviews(reviewsData);
      setBusinessRating(ratingData);
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

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-pink-50 to-pink-100">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <LoadingSpinner size="lg\" className="mx-auto mb-4" />
            <p className="text-gray-600">Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-pink-50 to-pink-100">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 tracking-wider">
              HEAR FROM OUR CUSTOMERS
            </h2>
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchReviews}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 to-pink-100 relative overflow-hidden">
      {/* Decorative Elements - matching your design */}
      <div className="absolute top-10 left-10 opacity-20">
        <div className="w-32 h-32 border-4 border-pink-300 rounded-full" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-20">
        <div className="w-24 h-24 border-4 border-pink-300 rounded-full" />
      </div>
      <div className="absolute top-1/2 left-20 opacity-20">
        <div className="w-16 h-16 border-4 border-pink-300 rounded-full" />
      </div>

      {/* Decorative corner patterns - matching your design */}
      <div className="absolute top-0 left-0 w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full text-pink-200 opacity-30">
          <path d="M0,0 L30,0 L30,30 L0,30 Z M70,0 L100,0 L100,30 L70,30 Z M0,70 L30,70 L30,100 L0,100 Z M70,70 L100,70 L100,100 L70,100 Z" fill="currentColor"/>
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full text-pink-200 opacity-30">
          <path d="M0,0 L30,0 L30,30 L0,30 Z M70,0 L100,0 L100,30 L70,30 Z M0,70 L30,70 L30,100 L0,100 Z M70,70 L100,70 L100,100 L70,100 Z" fill="currentColor"/>
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header - matching your design exactly */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 tracking-wider">
            HEAR FROM OUR CUSTOMERS
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real stories from couples who trusted us with their special day
          </p>
          
          {/* Google Reviews Badge */}
          {businessRating && (
            <div className="flex items-center justify-center mt-6 space-x-2">
              <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-md">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">{businessRating.business_name}</span>
                <div className="flex items-center ml-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-bold ml-1">{businessRating.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({businessRating.total_reviews.toLocaleString()})
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Review Cards - matching your pink design */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {reviews.map((review, index) => (
            <Card 
              key={review.id} 
              className={`bg-pink-100 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform ${
                currentReview === index ? 'hover:-translate-y-2' : 'hover:-translate-y-1'
              } border-2 border-pink-200`}
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={review.image || 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg'}
                  alt={`${review.name} wedding`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-bold">{review.name}</h3>
                  <p className="text-sm opacity-90">{review.location}</p>
                </div>
                <div className="absolute top-4 right-4">
                  <Quote className="w-8 h-8 text-white/80" />
                </div>
                
                {/* Google Reviews indicator */}
                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 rounded-full px-2 py-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-xs font-medium text-gray-700">Google</span>
                  </div>
                </div>
              </div>
              
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
                  "{review.comment}"
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
        <div className="flex justify-center space-x-2">
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

        {/* View More Reviews Link */}
        <div className="text-center mt-8">
          <a 
            href="https://www.google.com/search?q=Forever+N+Co+reviews" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-primary hover:text-primary-600 font-medium"
          >
            View all reviews on Google
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </section>
  );
}