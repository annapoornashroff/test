import { CartItemData } from '../types/api';

interface QueuedCartAction {
  type: 'ADD_TO_CART' | 'REMOVE_FROM_CART' | 'UPDATE_CART';
  data: CartItemData;
  timestamp: number;
}

const QUEUE_KEY = 'cart_action_queue';

// Helper function to check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

export const cartQueue = {
  addAction(action: Omit<QueuedCartAction, 'timestamp'>) {
    if (!isBrowser) return;
    
    const queue = this.getQueue();
    queue.push({
      ...action,
      timestamp: Date.now()
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  getQueue(): QueuedCartAction[] {
    if (!isBrowser) return [];
    
    const queue = localStorage.getItem(QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  },

  clearQueue() {
    if (!isBrowser) return;
    
    localStorage.removeItem(QUEUE_KEY);
  },

  hasPendingActions(): boolean {
    if (!isBrowser) return false;
    
    return this.getQueue().length > 0;
  }
};