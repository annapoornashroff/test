import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import Image from 'next/image';
import { type ReviewCardProps } from '@/lib/types/ui';

export function ReviewCard({ review, isActive = false, className = '' }: ReviewCardProps) {
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
    <Card 
      className={`bg-pink-100 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform ${
        isActive ? 'hover:-translate-y-2' : 'hover:-translate-y-1'
      } border-2 border-pink-200 ${className}`}
    >
      <div className="aspect-video relative overflow-hidden">
        <Image
          src={review.image || 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg'}
          alt={`${review.name} wedding`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
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
          &quot;{review.comment}&quot;
        </p>
        
        {/* Wedding Date */}
        <p className="text-xs text-gray-500">
          Wedding: {formatDate(review.wedding_date)}
        </p>
      </CardContent>
    </Card>
  );
}