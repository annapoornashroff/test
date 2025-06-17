import { Card, CardContent } from '@/components/ui/card';
import { Star, Check, X } from 'lucide-react';
import Image from 'next/image';
import { type ReviewResponse } from '@/lib/types/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ReviewCardProps {
  review: ReviewResponse;
  isActive?: boolean;
  className?: string;
  showApproval?: boolean;
  onApprove?: (reviewId: string) => void;
  onReject?: (reviewId: string) => void;
}

export function ReviewCard({ review, isActive = false, className, showApproval, onApprove, onReject }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card role="article" className={cn(
      'transition-all duration-300 ease-in-out',
      isActive ? 'scale-105 shadow-lg' : 'scale-100',
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            {review.profile_photo_url ? (
              <Image
                src={review.profile_photo_url}
                alt={`${review.author_name}'s profile`}
                width={48}
                height={48}
                className="rounded-full object-cover"
                fill={true}
                sizes="64px"
              />
            ) : (
              <div 
                className="w-full h-full bg-gray-200 flex items-center justify-center"
                role="img"
                aria-label="Default profile image"
              >
                <span className="text-2xl text-gray-500">
                  {review.author_name ? review.author_name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold truncate" data-testid="reviewer-name" aria-label={review.author_name || ''}>{review.author_name}</h4>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{review.city}</span>
                  {review.relative_time_description && (
                    <>
                      <span className="mx-1">•</span>
                      <span>{review.relative_time_description}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                  <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="currentColor"/>
                </svg>
                Google
              </div>
            </div>
            <div className="mt-2 flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  data-testid="star-icon"
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            {review.wedding_date && (
              <div className="mt-1 text-sm text-gray-500">
                Wedding Date: {formatDate(review.wedding_date)}
              </div>
            )}
            <p className="mt-2 text-gray-600 line-clamp-3">{review.text}</p>

            {showApproval && (
              <div className="flex space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApprove?.(review.id)}
                  disabled={review.status === 'approved'}
                  className="text-green-600 hover:text-green-800"
                >
                  <Check className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject?.(review.id)}
                  disabled={review.status === 'rejected'}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4 mr-1" /> Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}