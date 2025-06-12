import { Card, CardContent } from '@/components/ui/card';
import { Star, Calendar, Users } from 'lucide-react';
import { type ReviewStats as ReviewStatsType } from '@/lib/types/api';

interface ReviewStatsProps {
  stats: ReviewStatsType;
  className?: string;
}

export function ReviewStats({ stats, className }: ReviewStatsProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-500';
    if (rating >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatSource = (source: string) => {
    return source === 'google_places' ? 'Google Places API' : source;
  };

  const getPercentage = (count: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <Card role="article" className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-1.5">
          <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500 fill-current" />
            Customer Reviews
          </h3>
        </div>
        <div className="p-6 pt-0 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-3xl font-bold mr-2">{stats.average_rating.toFixed(1)}</div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    data-testid="star-icon"
                    className={`w-5 h-5 ${
                      i < Math.floor(stats.average_rating)
                        ? 'text-yellow-500 fill-current'
                        : i < Math.ceil(stats.average_rating)
                        ? 'text-yellow-500 fill-current opacity-50'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Based on {stats.total_reviews} reviews
            </div>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const percentage = getPercentage(stats.rating_distribution[rating] || 0, stats.total_reviews);
              return (
                <div key={rating} className="flex items-center">
                  <div className="w-12 text-sm">
                    {rating} stars
                  </div>
                  <div className="flex-1 mx-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={percentage}
                        className={`h-full ${getRatingColor(rating)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-right text-sm" data-testid={`rating-${rating}-percentage`}>
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-primary" />
              <div className="text-sm">
                <div className="font-medium">{stats.wedding_related_count}</div>
                <div className="text-gray-500">Wedding Reviews</div>
              </div>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-primary" />
              <div className="text-sm">
                <div className="font-medium">{stats.recent_reviews_count}</div>
                <div className="text-gray-500">Recent Reviews</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 pt-2">
            Data source: {formatSource(stats.source)}
            <br />
            Last updated: {formatDate(stats.last_updated)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}