import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { apiClient } from '../api-client'; // Changed from '../api'
import { cartQueue } from '../utils/cartQueue';
import { CartItemData } from '../types/api';
import { toast } from 'react-hot-toast';

export const useCart = () => {
  const [loading, setLoading] = useState(false);
  const [hasPendingActions, setHasPendingActions] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Check for pending actions only on client side
  useEffect(() => {
    setHasPendingActions(cartQueue.hasPendingActions());
  }, []);

  const handleCartAction = async (action: 'ADD_TO_CART' | 'REMOVE_FROM_CART' | 'UPDATE_CART', data: CartItemData) => {
    if (!user) {
      // Queue the action and redirect to login
      cartQueue.addAction({ type: action, data });
      router.push('/login?redirect=cart');
      return;
    }

    try {
      setLoading(true);
      const token = await user.getIdToken();

      switch (action) {
        case 'ADD_TO_CART':
          await apiClient.addToCart(data, token); // Fixed parameter order
          toast.success('Added to cart');
          break;
        case 'REMOVE_FROM_CART':
          await apiClient.removeFromCart(data.vendor_id); // Fixed - no token needed
          toast.success('Removed from cart');
          break;
        case 'UPDATE_CART':
          await apiClient.updateCartItem(data.vendor_id, data); // Fixed - no token needed
          toast.success('Cart updated');
          break;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const processQueuedActions = async () => {
    if (!user) return;

    const queue = cartQueue.getQueue();
    if (queue.length === 0) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();

      for (const action of queue) {
        await handleCartAction(action.type, action.data);
      }

      cartQueue.clearQueue();
      toast.success('Cart updated with pending items');
    } catch (error: any) {
      toast.error('Failed to process some cart actions');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleCartAction,
    processQueuedActions,
    hasPendingActions
  };
};