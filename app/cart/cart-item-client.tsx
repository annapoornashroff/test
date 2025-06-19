'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Trash2, Calendar, MapPin, Star, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { type CartItem } from '@/lib/types/ui';
import React from 'react';
import { SUPPORTED_CITIES } from '@/lib/constants';

interface CartItemClientProps {
  item: CartItem;
  removeItem: (id: number) => Promise<void>;
  updateItemStatus: (id: number, status: 'wishlisted' | 'visited' | 'selected' | 'booked') => Promise<void>;
  getStatusIcon: (status: string) => React.ElementType;
  getStatusColor: (status: string) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  cartActionLoading: boolean;
}

export default function CartItemClient({
  item,
  removeItem,
  updateItemStatus,
  getStatusIcon,
  getStatusColor,
  formatCurrency,
  formatDate,
  cartActionLoading,
}: CartItemClientProps) {
  const StatusIcon = getStatusIcon(item.status);

  return (
    <Card key={item.id} className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex">
          <div className="relative w-32 h-32">
            <Image
              src={item.vendor?.images?.[0] || 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg'}
              alt={item.vendor?.name || 'Vendor'}
              fill
              className="object-cover"
            />
          </div>
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
              {item.vendor?.city || SUPPORTED_CITIES[0]}
              <span className="mx-2">•</span>
              <Star className="w-4 h-4 mr-1 text-yellow-500" />
              {item.vendor?.rating || '4.5'}
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-4">
              <Calendar className="w-4 h-4 mr-1" />
              Booking Date: {item.booking_date ? formatDate(item.booking_date) : 'N/A'}
            </div>

            <div className="flex items-center justify-between">
              <div className="font-bold text-lg text-primary">
                {formatCurrency(item.price)}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => updateItemStatus(item.id, 'visited')}
                  disabled={item.status === 'visited' || cartActionLoading}
                >
                  Mark Visited
                </Button>
                <Button 
                  variant="gold" 
                  size="sm" 
                  onClick={() => updateItemStatus(item.id, 'booked')}
                  disabled={item.status === 'booked' || cartActionLoading}
                >
                  Mark Booked
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => removeItem(item.id)}
                  disabled={cartActionLoading}
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
} 