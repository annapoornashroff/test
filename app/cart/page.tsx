'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { 
  Heart, Trash2, Calendar, MapPin, Star, 
  ShoppingCart, CheckCircle, Clock, AlertCircle,
  PieChart, IndianRupee
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { apiClient } from '@/lib/api';

const categories = [
  'Photography', 'Catering', 'Decoration', 'Makeup', 'Music & DJ', 'Venues'
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
  useProtectedRoute();

  useEffect(() => {
    if (user) {
      fetchCartData();
    }
  }, [user]);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError('');
      if (!user) throw new Error('No user found')
      const token = await user.getIdToken();
      const [items, summary] = await Promise.all([
        apiClient.getCartItems(token),
        apiClient.getCartSummary(token)
      ]);
      
      setCartItems(items);
      setCartSummary(summary);
    } catch (error: any) {
      console.error('Error fetching cart data:', error);
      setError(error.message || 'Failed to load cart data');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id: number) => {
    try {
      if (!user) throw new Error('No user found');
      const token = await user.getIdToken();
      await apiClient.removeFromCart(token, id.toString());

      // Refresh cart data
      await fetchCartData();
    } catch (error: any) {
      console.error('Error removing item:', error);
      setError(error.message || 'Failed to remove item');
    }
  };

  const updateItemStatus = async (id: number, status: string) => {
    try {
      const token = await user?.getIdToken();
      await apiClient.updateCartItem(token, id.toString(), { status });
      
      // Refresh cart data
      await fetchCartData();
    } catch (error: any) {
      console.error('Error updating item:', error);
      setError(error.message || 'Failed to update item');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'wishlisted': return 'text-purple-600 bg-purple-50';
      case 'visited': return 'text-blue-600 bg-blue-50';
      case 'selected': return 'text-orange-600 bg-orange-50';
      case 'booked': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'wishlisted': return Heart;
      case 'visited': return Clock;
      case 'selected': return AlertCircle;
      case 'booked': return CheckCircle;
      default: return Clock;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const calculateCompletionPercentage = () => {
    if (!cartItems.length) return 0;
    return Math.round((cartItems.length / categories.length) * 100);
  };

  const getCategoryProgress = () => {
    return categories.map(category => ({
      name: category,
      completed: cartItems.some((item: any) => item.category === category),
      status: cartItems.find((item: any) => item.category === category)?.status || 'pending'
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  const completionPercentage = calculateCompletionPercentage();
  const categoryProgress = getCategoryProgress();

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
                <Button variant="gold-outline" size="sm" className="rounded-full">
                  Browse Vendors
                </Button>
              </Link>
              <Link href="/wishlist">
                <Button variant="gold" size="sm" className="rounded-full">
                  <Heart className="w-4 h-4 mr-2" />
                  Wishlist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Page Header */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                Your Wedding Cart
              </h2>
              <p className="text-gray-600">
                Track your wedding planning progress and manage your selected vendors
              </p>
            </div>

            {error && (
              <ErrorMessage message={error} className="mb-6" />
            )}

            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item: any) => {
                const StatusIcon = getStatusIcon(item.status);
                return (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        <img
                          src={item.vendor?.images?.[0] || 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg'}
                          alt={item.vendor?.name || 'Vendor'}
                          className="w-32 h-32 object-cover"
                        />
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {item.vendor?.name || 'Vendor Name'}
                              </h3>
                              <p className="text-sm text-gold font-medium">{item.category}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(item.status)}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {item.status}
                            </div>
                          </div>

                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            {item.vendor?.location || 'Location'}
                            <span className="mx-2">•</span>
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            {item.vendor?.rating || '4.5'}
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-bold text-gray-900">
                                {formatCurrency(item.price)}
                              </p>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(item.booking_date)}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {item.status === 'visited' && (
                                <Button 
                                  size="sm" 
                                  className="bg-primary hover:bg-primary-600"
                                  onClick={() => updateItemStatus(item.id, 'selected')}
                                >
                                  Book Now
                                </Button>
                              )}
                              {item.status === 'selected' && (
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => updateItemStatus(item.id, 'booked')}
                                >
                                  Confirm Booking
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeItem(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Empty State */}
            {cartItems.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-600 mb-6">Start adding vendors to plan your perfect wedding</p>
                  <Link href="/vendors">
                    <Button className="bg-primary hover:bg-primary-600">
                      Browse Vendors
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Planning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {completionPercentage}%
                  </div>
                  <p className="text-sm text-gray-600">Complete</p>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {categoryProgress.map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{category.name}</span>
                      <div className="flex items-center">
                        {category.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Budget Summary */}
            {cartSummary && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <IndianRupee className="w-5 h-5 mr-2" />
                    Budget Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Selected</span>
                    <span className="font-semibold">{formatCurrency(cartSummary.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items</span>
                    <span className="font-semibold">{cartSummary.total_items}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-primary">{formatCurrency(cartSummary.total_amount)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button className="w-full bg-primary hover:bg-primary-600">
                  Proceed to Payment
                </Button>
                <Button variant="outline" className="w-full">
                  Save as Package
                </Button>
                <Link href="/vendors">
                  <Button variant="ghost" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Add */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Add</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.filter(cat => !categoryProgress.find(cp => cp.name === cat)?.completed).map((category) => (
                    <Link key={category} href={`/vendors?category=${category}`}>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Add {category}
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}