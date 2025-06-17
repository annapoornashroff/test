'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { 
  Users, Plus, Search, Filter, Download, Send, 
  Heart, Phone, Mail, Check, X, Clock, Edit, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { type WeddingProject, type PersonalInfo } from '@/lib/types/ui';
import GuestListHeader from './guest-list-header';
import GuestPageHeader from './guest-page-header';
import GuestWeddingStatsSection from './guest-wedding-stats-section';
import GuestFilterSearchSection from './guest-filter-search-section';
import GuestListTable from './guest-list-table';

// Add type for user
type User = {
  getIdToken: () => Promise<string>;
};

// Add type for wedding data
type Wedding = {
  id: number;
  name: string;
};

const guestCategories = ['Family', 'Friends', 'Colleagues', 'Neighbors', 'Others'];

export default function GuestsClient() {
  const [guests, setGuests] = useState<any[]>([]);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [selectedWedding, setSelectedWedding] = useState('');
  const [guestStats, setGuestStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    relationship: '',
    category: 'Family'
  });

  const { user } = useAuth() as { user: User | null };
  useProtectedRoute();

  const fetchWeddings = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const weddingsData = await apiClient.getWeddings() as Wedding[];
      
      setWeddings(weddingsData);
      if (weddingsData.length > 0) {
        setSelectedWedding(weddingsData[0].id.toString());
      }
    } catch (error: any) {
      console.error('Error fetching weddings:', error);
      setError(error.message || 'Failed to load weddings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchGuests = useCallback(async () => {
    if (!user || !selectedWedding) return;

    try {
      const guestsData = await apiClient.getGuests(parseInt(selectedWedding));
      setGuests(guestsData as any[]);
    } catch (error: any) {
      console.error('Error fetching guests:', error);
      setError(error.message || 'Failed to load guests');
    }
  }, [user, selectedWedding]);

  const fetchGuestStats = useCallback(async () => {
    if (!user || !selectedWedding) return;

    try {
      const stats = await apiClient.getGuestStatistics(parseInt(selectedWedding));
      setGuestStats(stats);
    } catch (error: any) {
      console.error('Error fetching guest stats:', error);
    }
  }, [user, selectedWedding]);

  const addGuest = async () => {
    if (!user || !newGuest.name || !newGuest.phoneNumber || !selectedWedding) return;

    try {
      await apiClient.addGuest({
        ...newGuest,
        wedding_id: parseInt(selectedWedding)
      });

      setNewGuest({
        name: '',
        phoneNumber: '',
        email: '',
        relationship: '',
        category: 'Family'
      });
      setShowAddForm(false);
      
      // Refresh data
      await fetchGuests();
      await fetchGuestStats();
    } catch (error: any) {
      console.error('Error adding guest:', error);
      setError(error.message || 'Failed to add guest');
    }
  };

  const sendInvitation = async (guestId: number) => {
    if (!user) return;

    try {
      await apiClient.sendInvitation(guestId);
      
      await fetchGuests();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      setError(error.message || 'Failed to send invitation');
    }
  };

  const updateConfirmationStatus = async (guestId: number, status: string) => {
    if (!user) return;

    try {
      await apiClient.updateGuest(guestId, {
        confirmation_status: status
      });
      
      await fetchGuests();
      await fetchGuestStats();
    } catch (error: any) {
      console.error('Error updating guest status:', error);
      setError(error.message || 'Failed to update guest status');
    }
  };

  const removeGuest = async (guestId: number) => {
    if (!user) return;

    try {
      await apiClient.deleteGuest(guestId);
      
      await fetchGuests();
      await fetchGuestStats();
    } catch (error: any) {
      console.error('Error removing guest:', error);
      setError(error.message || 'Failed to remove guest');
    }
  };

  const filteredGuests = guests.filter((guest: any) => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guest.phone_number.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || guest.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || guest.confirmation_status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'declined': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return Check;
      case 'declined': return X;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading guest list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestListHeader />

      <div className="container mx-auto px-6 py-8">
        <GuestPageHeader />

        {error && (
          <ErrorMessage message={error} className="mb-6" />
        )}

        <GuestWeddingStatsSection
          weddings={weddings}
          selectedWedding={selectedWedding}
          setSelectedWedding={setSelectedWedding}
          guestStats={guestStats}
          fetchGuests={fetchGuests}
          fetchGuestStats={fetchGuestStats}
          showAddForm={showAddForm}
          setShowAddForm={setShowAddForm}
          newGuest={newGuest}
          setNewGuest={setNewGuest}
          addGuest={addGuest}
          guestCategories={guestCategories}
        />

        {/* Guest Add Form */}
        {showAddForm && (
           <Card className="mb-6">
             <CardHeader>
               <CardTitle>Add New Guest</CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input
                 placeholder="Guest Name"
                 value={newGuest.name}
                 onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
               />
               <Input
                 placeholder="Phone Number (e.g., +919876543210)"
                 value={newGuest.phoneNumber}
                 onChange={(e) => setNewGuest({ ...newGuest, phoneNumber: e.target.value })}
               />
               <Input
                 placeholder="Email (Optional)"
                 value={newGuest.email}
                 onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
               />
               <Input
                 placeholder="Relationship (e.g., Cousin, Friend)"
                 value={newGuest.relationship}
                 onChange={(e) => setNewGuest({ ...newGuest, relationship: e.target.value })}
               />
               <select
                 value={newGuest.category}
                 onChange={(e) => setNewGuest({ ...newGuest, category: e.target.value })}
                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
               >
                 {guestCategories.map(cat => (
                   <option key={cat} value={cat}>{cat}</option>
                 ))}
               </select>
               <Button onClick={addGuest} className="col-span-1 md:col-span-2 bg-gold hover:bg-gold-600">
                 Save Guest
               </Button>
             </CardContent>
           </Card>
         )}

        <GuestFilterSearchSection 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          guestCategories={guestCategories}
        />

        <GuestListTable
          filteredGuests={filteredGuests}
          sendInvitation={sendInvitation}
          updateConfirmationStatus={updateConfirmationStatus}
          removeGuest={removeGuest}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
        />

      </div>
    </div>
  );
}