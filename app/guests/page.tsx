'use client';

import { useState, useEffect } from 'react';
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
import { apiClient } from '@/lib/api';

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

export default function GuestsPage() {
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

  useEffect(() => {
    if (user) {
      fetchWeddings();
    }
  }, [user]);

  useEffect(() => {
    if (selectedWedding) {
      fetchGuests();
      fetchGuestStats();
    }
  }, [selectedWedding]);

  const fetchWeddings = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = await user.getIdToken();
      const weddingsData = await apiClient.getWeddings(token) as Wedding[];
      
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
  };

  const fetchGuests = async () => {
    if (!user || !selectedWedding) return;

    try {
      const token = await user.getIdToken();
      const guestsData = await apiClient.getGuests(token, selectedWedding);
      setGuests(guestsData as any[]);
    } catch (error: any) {
      console.error('Error fetching guests:', error);
      setError(error.message || 'Failed to load guests');
    }
  };

  const fetchGuestStats = async () => {
    if (!user || !selectedWedding) return;

    try {
      const token = await user.getIdToken();
      const stats = await apiClient.getGuestStatistics(token, selectedWedding);
      setGuestStats(stats);
    } catch (error: any) {
      console.error('Error fetching guest stats:', error);
    }
  };

  const addGuest = async () => {
    if (!user || !newGuest.name || !newGuest.phoneNumber || !selectedWedding) return;

    try {
      const token = await user.getIdToken();
      await apiClient.addGuest(token, {
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
      const token = await user.getIdToken();
      await apiClient.sendInvitation(token, guestId.toString());
      
      // Refresh guests to show updated invitation status
      await fetchGuests();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      setError(error.message || 'Failed to send invitation');
    }
  };

  const updateConfirmationStatus = async (guestId: number, status: string) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      await apiClient.updateGuest(token, guestId.toString(), {
        confirmation_status: status
      });
      
      // Refresh data
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
      const token = await user.getIdToken();
      await apiClient.deleteGuest(token, guestId.toString());
      
      // Refresh data
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
              <Link href="/cart">
                <Button variant="gold" size="sm" className="rounded-full">
                  Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Guest List Management
            </h2>
            <p className="text-gray-600">
              Manage your wedding guest list and track RSVPs
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Wedding Selector */}
            {weddings.length > 0 && (
              <select
                value={selectedWedding}
                onChange={(e) => setSelectedWedding(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                {weddings.map((wedding) => (
                  <option key={wedding.id} value={wedding.id}>
                    {wedding.name}
                  </option>
                ))}
              </select>
            )}

            <Button variant="outline" className="rounded-full">
              <Download className="w-4 h-4 mr-2" />
              Export List
            </Button>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-primary hover:bg-primary-600 rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Guest
            </Button>
          </div>
        </div>

        {error && (
          <ErrorMessage message={error} className="mb-6" />
        )}

        {/* Stats Cards */}
        {guestStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{guestStats.total}</div>
                <div className="text-sm text-gray-600">Total Guests</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{guestStats.confirmed}</div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{guestStats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{guestStats.declined}</div>
                <div className="text-sm text-gray-600">Declined</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{guestStats.invitations_sent}</div>
                <div className="text-sm text-gray-600">Invitations Sent</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search guests by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-12 border border-gray-300 rounded-lg px-3"
                >
                  <option value="All">All Categories</option>
                  {guestCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-12 border border-gray-300 rounded-lg px-3"
                >
                  <option value="All">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Guest Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Guest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name *"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Phone Number *"
                  value={newGuest.phoneNumber}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
                <Input
                  placeholder="Email Address"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  placeholder="Relationship"
                  value={newGuest.relationship}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, relationship: e.target.value }))}
                />
                <select
                  value={newGuest.category}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, category: e.target.value }))}
                  className="h-10 border border-gray-300 rounded-lg px-3"
                >
                  {guestCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <Button onClick={addGuest} className="bg-primary hover:bg-primary-600">
                  Add Guest
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guest List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Guest List ({filteredGuests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredGuests.map((guest: any) => {
                const StatusIcon = getStatusIcon(guest.confirmation_status);
                return (
                  <div key={guest.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="font-semibold text-lg">{guest.name}</h3>
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                            {guest.category}
                          </span>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(guest.confirmation_status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {guest.confirmation_status}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {guest.phone_number}
                          </div>
                          {guest.email && (
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {guest.email}
                            </div>
                          )}
                          {guest.relationship && (
                            <span>{guest.relationship}</span>
                          )}
                        </div>

                        {guest.invitation_sent && (
                          <div className="text-xs text-gray-500 mt-1">
                            Invitation sent: {new Date(guest.invitation_sent_at).toLocaleDateString()}
                            {guest.response_at && ` • Responded: ${new Date(guest.response_at).toLocaleDateString()}`}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {!guest.invitation_sent && (
                          <Button 
                            size="sm" 
                            onClick={() => sendInvitation(guest.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Send Invite
                          </Button>
                        )}
                        
                        {guest.confirmation_status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateConfirmationStatus(guest.id, 'confirmed')}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateConfirmationStatus(guest.id, 'declined')}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => removeGuest(guest.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredGuests.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No guests found</h3>
                <p className="text-gray-600 mb-6">
                  {guests.length === 0 ? 'Start adding guests to your wedding' : 'Try adjusting your search criteria'}
                </p>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-primary hover:bg-primary-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Guest
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {guests.length > 0 && (
          <div className="mt-6 flex items-center justify-center space-x-4">
            <Button variant="outline" className="rounded-full">
              Send All Invitations
            </Button>
            <Button variant="outline" className="rounded-full">
              Export Guest List
            </Button>
            <Button variant="outline" className="rounded-full">
              Import from Contacts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}