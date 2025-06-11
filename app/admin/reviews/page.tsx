'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { ReviewStats } from '@/components/ui/review-stats';
import { GoogleReviewsBadge } from '@/components/ui/google-reviews-badge';
import { 
  Heart, Star, RefreshCw, Settings, 
  ExternalLink, AlertTriangle, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useReviews } from '@/lib/hooks/useReviews';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';

export default function AdminReviewsPage() {
  const { reviews, businessRating, reviewStats, loading, error, refreshReviews } = useReviews(10);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState('');

  const { user } = useAuth();
  useProtectedRoute();

  useEffect(() => {
    checkReviewsHealth();
  }, []);

  const checkReviewsHealth = async () => {
    try {
      setHealthLoading(true);
      setHealthError('');
      
      const response = await fetch('/api/reviews/health');
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const data = await response.json();
      setHealthStatus(data);
    } catch (error: any) {
      console.error('Error checking reviews health:', error);
      setHealthError(error.message || 'Failed to check reviews service health');
    } finally {
      setHealthLoading(false);
    }
  };

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
                <p className="text-xs text-gold-600 uppercase tracking-wider">Admin Dashboard</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Home
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="gold" size="sm">
                  Exit Admin
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
            Google Reviews Management
          </h2>
          <p className="text-gray-600">
            Monitor and manage Google Reviews integration
          </p>
        </div>

        {error && (
          <ErrorMessage message={error} className="mb-6" />
        )}

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* API Status */}
          <Card className={`${healthStatus?.status === 'healthy' ? 'border-green-500' : 'border-red-500'} border-2`}>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                {healthStatus?.status === 'healthy' ? (
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                )}
                API Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthLoading ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : healthError ? (
                <div>
                  <p className="text-red-500 mb-2">{healthError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={checkReviewsHealth}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Status:</div>
                    <div className={`font-medium ${healthStatus?.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                      {healthStatus?.status === 'healthy' ? 'Healthy' : 'Error'}
                    </div>
                    
                    <div className="text-gray-500">API Configured:</div>
                    <div className="font-medium">
                      {healthStatus?.google_api_configured ? 'Yes' : 'No'}
                    </div>
                    
                    <div className="text-gray-500">Data Source:</div>
                    <div className="font-medium">
                      {healthStatus?.data_source === 'google_places' ? 'Google Places API' : 'Mock Data'}
                    </div>
                    
                    <div className="text-gray-500">Fallback:</div>
                    <div className="font-medium">
                      {healthStatus?.fallback_available ? 'Available' : 'Not Available'}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={checkReviewsHealth}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Rating */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Rating</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : businessRating ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <GoogleReviewsBadge 
                      rating={businessRating.rating} 
                      reviewCount={businessRating.total_reviews}
                      businessName={businessRating.business_name}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Rating:</div>
                    <div className="font-medium">{businessRating.rating.toFixed(1)}</div>
                    
                    <div className="text-gray-500">Total Reviews:</div>
                    <div className="font-medium">{businessRating.total_reviews.toLocaleString()}</div>
                    
                    <div className="text-gray-500">Business Name:</div>
                    <div className="font-medium">{businessRating.business_name}</div>
                    
                    <div className="text-gray-500">Data Source:</div>
                    <div className="font-medium">
                      {businessRating.source === 'google_places' ? 'Google Places API' : 'Mock Data'}
                    </div>
                  </div>
                  
                  <a 
                    href={`https://search.google.com/local/reviews?placeid=${healthStatus?.place_id || ''}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Google
                    </Button>
                  </a>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No rating data available</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshReviews}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Total Fetched:</div>
                    <div className="font-medium">{reviews.length}</div>
                    
                    <div className="text-gray-500">5-Star Reviews:</div>
                    <div className="font-medium">
                      {reviews.filter(r => r.rating === 5).length}
                    </div>
                    
                    <div className="text-gray-500">Wedding Related:</div>
                    <div className="font-medium">
                      {reviews.filter(r => r.is_wedding_related).length}
                    </div>
                    
                    <div className="text-gray-500">Latest Review:</div>
                    <div className="font-medium">
                      {reviews[0]?.relative_time || 'Unknown'}
                    </div>
                  </div>
                  
                  <Link href="/reviews">
                    <Button variant="outline" size="sm" className="w-full">
                      <Star className="w-4 h-4 mr-2" />
                      View All Reviews
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No reviews available</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshReviews}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Review Statistics */}
        {reviewStats && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <ReviewStats stats={reviewStats} />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Google Places API Setup</h4>
                  <p className="text-sm text-gray-600">
                    To configure Google Reviews integration, you need to set up the following environment variables:
                  </p>
                  
                  <div className="bg-gray-100 p-3 rounded-md text-sm font-mono">
                    <div>GOOGLE_PLACES_API_KEY=your-api-key</div>
                    <div>GOOGLE_PLACE_ID=your-business-place-id</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">How to Get Your Place ID</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal pl-4">
                    <li>Go to <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google's Place ID Finder</a></li>
                    <li>Enter your business name and location</li>
                    <li>Copy the Place ID that appears</li>
                    <li>Add it to your environment variables</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Getting a Google Places API Key</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal pl-4">
                    <li>Go to the <a href="https://console.cloud.google.com/apis/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a></li>
                    <li>Create a new project or select an existing one</li>
                    <li>Enable the Places API</li>
                    <li>Create API credentials and copy your API key</li>
                    <li>Add it to your environment variables</li>
                  </ol>
                </div>
                
                <div className="pt-2">
                  <a 
                    href="https://developers.google.com/maps/documentation/places/web-service/overview" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm flex items-center"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Google Places API Documentation
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Reviews Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Reviews</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshReviews}
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm\" className="mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="md" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews available</h3>
                <p className="text-gray-600 mb-6">
                  {healthStatus?.google_api_configured 
                    ? "We couldn't find any reviews. Try refreshing or check your Place ID."
                    : "Google Places API is not configured. Add your API key and Place ID to see real reviews."}
                </p>
                <Button onClick={refreshReviews}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Reviews
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Reviewer</th>
                        <th className="text-left py-2 px-2">Rating</th>
                        <th className="text-left py-2 px-2">Comment</th>
                        <th className="text-left py-2 px-2">Date</th>
                        <th className="text-left py-2 px-2">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map(review => (
                        <tr key={review.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2">
                            <div className="font-medium">{review.name}</div>
                            <div className="text-xs text-gray-500">{review.location}</div>
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </td>
                          <td className="py-2 px-2 max-w-xs">
                            <div className="truncate">{review.comment}</div>
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap">
                            {review.relative_time || new Date(review.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              review.source === 'google_reviews' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {review.source === 'google_reviews' ? 'Google' : 'Mock'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-center">
                  <Link href="/reviews">
                    <Button variant="outline">
                      View All Reviews
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}