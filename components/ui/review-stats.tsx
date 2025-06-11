import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Users, Calendar } from 'lucide-react';
import { type ReviewStatsProps } from '@/lib/types/ui';

export function ReviewStats({ stats, className = '' }: ReviewStatsProps) {
  // Calculate percentage for each rating
  const totalRatings = Object.values(stats.rating_distribution).reduce((a, b) => a + b, 0);
  const getPercentage = (count: number) => {
    if (totalRatings === 0) return 0;
    return Math.round((count / totalRatings) * 100);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="w-5 h-5 mr-2 text-yellow-500 fill-current" />
          Customer Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-3xl font-bold mr-2">{stats.average_rating.toFixed(1)}</div>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-5 h-5 ${
                    i < Math.floor(stats.average_rating) 
                      ? 'text-yellow-500 fill-current' 
                      : i < stats.average_rating 
                        ? 'text-yellow-500 fill-current opacity-50' 
                        : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Based on {stats.total_reviews.toLocaleString()} reviews
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center">
              <div className="w-12 text-sm">{rating} stars</div>
              <div className="flex-1 mx-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${rating >= 4 ? 'bg-green-500' : rating === 3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${getPercentage(stats.rating_distribution[rating])}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-right text-sm">
                {getPercentage(stats.rating_distribution[rating])}%
              </div>
            </div>
          ))}
        </div>

        {/* Additional Stats */}
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

        {/* Source */}
        <div className="text-xs text-gray-500 pt-2">
          Data source: {stats.source === 'google_places' ? 'Google Places API' : 'Sample Data'}
          <br />
          Last updated: {new Date(stats.last_updated).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}