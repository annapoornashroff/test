'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Plus, Download, Send, Phone, Mail, Check, X, Clock, Edit, Trash2 } from 'lucide-react';
import { type WeddingProject } from '@/lib/types/ui';
import { type GuestResponse } from '@/lib/types/api';
import React, { ChangeEvent, FormEvent } from 'react';

type Wedding = {
  id: number;
  name: string;
};

interface GuestWeddingStatsSectionProps {
  weddings: Wedding[];
  selectedWedding: string;
  setSelectedWedding: (value: string) => void;
  guestStats: any;
  fetchGuests: () => Promise<void>;
  fetchGuestStats: () => Promise<void>;
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  newGuest: any; // Define a more specific type if possible
  setNewGuest: (guest: any) => void;
  addGuest: () => Promise<void>;
  guestCategories: string[];
}

export default function GuestWeddingStatsSection({
  weddings,
  selectedWedding,
  setSelectedWedding,
  guestStats,
  fetchGuests,
  fetchGuestStats,
  showAddForm,
  setShowAddForm,
  newGuest,
  setNewGuest,
  addGuest,
  guestCategories,
}: GuestWeddingStatsSectionProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Select Wedding</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedWedding}
            onChange={(e) => setSelectedWedding(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {weddings.map((wedding) => (
              <option key={wedding.id} value={wedding.id.toString()}>
                {wedding.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Guest Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{guestStats?.total_guests || 0}</p>
            <p className="text-sm text-gray-500">Total Guests</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{guestStats?.confirmed_guests || 0}</p>
            <p className="text-sm text-gray-500">Confirmed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{guestStats?.declined_guests || 0}</p>
            <p className="text-sm text-gray-500">Declined</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{guestStats?.pending_guests || 0}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
        </CardContent>
      </Card>
      
      <Button onClick={() => setShowAddForm(true)} className="bg-primary hover:bg-primary-600">
        <Plus className="w-4 h-4 mr-2" />
        Add New Guest
      </Button>
    </div>
  );
} 