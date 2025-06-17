'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { 
  Heart, Trash2, Calendar, MapPin, Star, 
  ShoppingCart, CheckCircle, Clock, AlertCircle,
  PieChart, IndianRupee, Plus
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { apiClient } from '@/lib/api-client';
import Image from 'next/image';
import { useCart } from '@/lib/hooks/useCart';
import { type CartItem, type CartSummary } from '@/lib/types/ui';
import CartHeader from './cart-header';
import CartSummaryCard from './cart-summary-card';
import PlanningProgressCard from './planning-progress-card';
import QuickLinksCard from './quick-links-card';
import CartItemClient from './cart-item-client';

const categories = [
  'Photography', 'Catering', 'Decoration', 'Makeup', 'Music & DJ', 'Venues'
];

export default function CartClient() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { handleCartAction, loading: cartActionLoading } = useCart();
  useProtectedRoute();

  const fetchCartData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!user) throw new Error('No user found');
      const [items, summary] = await Promise.all([
        apiClient.getCartItems(),
        apiClient.getCartSummary()
      ]);
      
      setCartItems(items as CartItem[]);
      setCartSummary(summary as CartSummary);
    } catch (error: any) {
      console.error('Error fetching cart data:', error);
      setError(error.message || 'Failed to load cart data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCartData();
    }
  }, [user, fetchCartData]);

  const removeItem = async (id: number) => {
    try {
      await handleCartAction('REMOVE_FROM_CART', {
        vendor_id: id,
        wedding_id: cartItems.find(item => item.id === id)?.wedding_id || 0,
        category: '',
        price: 0,
        booking_date: new Date().toISOString(),
        status: 'wishlisted'
      });

      // Refresh cart data
      await fetchCartData();
    } catch (error: any) {
      console.error('Error removing item:', error);
      setError(error.message || 'Failed to remove item');
    }
  };

  const updateItemStatus = async (id: number, status: 'wishlisted' | 'visited' | 'selected' | 'booked') => {
    try {
      const item = cartItems.find(item => item.id === id);
      if (!item) return;

      await handleCartAction('UPDATE_CART', {
        vendor_id: id,
        wedding_id: item.wedding_id,
        category: item.category,
        price: item.price,
        booking_date: item.booking_date,
        status
      });
      
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
      completed: cartItems.some((item: CartItem) => item.category === category),
      status: cartItems.find((item: CartItem) => item.category === category)?.status || 'pending'
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
      <CartHeader />

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
              {cartItems.map((item: CartItem) => (
                <CartItemClient 
                  key={item.id}
                  item={item}
                  removeItem={removeItem}
                  updateItemStatus={updateItemStatus}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  cartActionLoading={cartActionLoading}
                />
              ))}

              {cartItems.length === 0 && !loading && (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-600 mb-6">Start adding vendors to your wedding cart!</p>
                  <Link href="/vendors">
                    <Button className="bg-primary hover:bg-primary-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Browse Vendors
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Cart Summary */}
          <div className="lg:col-span-1 space-y-6">
            <CartSummaryCard cartSummary={cartSummary} formatCurrency={formatCurrency} />

            <PlanningProgressCard 
              completionPercentage={completionPercentage}
              categoryProgress={categoryProgress}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
            />

            <QuickLinksCard />
          </div>
        </div>
      </div>
    </div>
  );
}