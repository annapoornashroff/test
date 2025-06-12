import { CartItemData } from '../types/api';

interface QueuedCartAction {
  type: 'ADD_TO_CART' | 'REMOVE_FROM_CART' | 'UPDATE_CART';
  data: CartItemData;
  timestamp: number;
}

const QUEUE_KEY = 'cart_action_queue';

export const cartQueue = {
  addAction(action: Omit<QueuedCartAction, 'timestamp'>) {
    const queue = this.getQueue();
    queue.push({
      ...action,
      timestamp: Date.now()
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  getQueue(): QueuedCartAction[] {
    const queue = localStorage.getItem(QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  },

  clearQueue() {
    localStorage.removeItem(QUEUE_KEY);
  },

  hasPendingActions(): boolean {
    return this.getQueue().length > 0;
  }
}; 