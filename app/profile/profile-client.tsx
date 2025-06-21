'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { 
  User, Heart, Edit, Save, X, Calendar, MapPin, 
  IndianRupee, Plane, CheckCircle, XCircle, Clock,
  Router
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { apiClient, handleApiError } from '@/lib/api-client';
import { toast } from 'sonner';
import { type FamilyMember } from '@/lib/types/ui';
import ProfileTabs from './profile-tabs';
import ProfileTab from './profile-tab';
import WeddingsTab from './wedding-tab';
import FamilyMembersTab from './family-members-tab';
import { WeddingData } from '@/lib/types/api';
import { useRouter } from 'next/navigation';

export default function ProfileClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('personal');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [weddings, setWeddings] = useState<WeddingData[]>([]);

  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [newFamilyMember, setNewFamilyMember] = useState<Omit<FamilyMember, 'id'>>({
    name: '',
    relationship: '',
    phoneNumber: '',
    email: '',
    role: 'PARTICIPANT'
  });

  const [showAddFamily, setShowAddFamily] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRelationship, setInviteRelationship] = useState('');
  const [inviting, setInviting] = useState(false);

  const { user, userProfile } = useAuth();
  useProtectedRoute();

  if (!userProfile){
    router.replace('/signup');
  }

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);

      // Load weddings
      const fetched_weddings = await apiClient.getWeddings() as WeddingData[];
      setWeddings(fetched_weddings);

      // Load family members (from the first wedding project if available)
      if (fetched_weddings.length > 0) {
        const familyDetails = fetched_weddings[0].family_details || [];
        setFamily(familyDetails.map((member: any, index: number) => ({
          id: index + 1,
          ...member
        })));
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  const addFamilyMember = async () => {
    if (!newFamilyMember.name || !newFamilyMember.phoneNumber) {
      toast.error('Name and phone number are required');
      return;
    }

    try {
      setSaving(true);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First check if user exists
      const existingUser = await apiClient.getUserByPhone(newFamilyMember.phoneNumber);
      
      if (!existingUser) {
        // Show invite dialog if user doesn't exist
        setInvitePhone(newFamilyMember.phoneNumber);
        setInviteName(newFamilyMember.name);
        setInviteRelationship(newFamilyMember.relationship);
        setShowInviteDialog(true);
        return;
      }

      // Create relationship
      // TODO: Poosible future bug
      if (existingUser.id){
        await apiClient.createRelationship({
          related_user_id: existingUser.id,
          relationship_type: 'family',
          relationship_name: newFamilyMember.relationship,
          is_primary: true,
          privacy_level: 'PRIVATE'
        });
      }
      
      // Add to family members array
      const updatedFamily = [...family, {
        id: family.length + 1,
        ...newFamilyMember,
        user_id: existingUser.id
      }];
      
      setFamily(updatedFamily);
      
      // Update wedding project with new family details
      if (weddings.length > 0 && weddings[0].id) {
        await apiClient.updateWedding(weddings[0].id, {
          family_details: updatedFamily.map(({ id, ...rest }) => rest)
        });
      }

      setNewFamilyMember({
        name: '',
        relationship: '',
        phoneNumber: '',
        email: '',
        role: 'PARTICIPANT'
      });
      
      setShowAddFamily(false);
      toast.success('Family member added successfully');
    } catch (error: any) {
      handleApiError(error, 'Failed to add family member');
    } finally {
      setSaving(false);
    }
  };

  const sendInvite = async () => {
    if (!invitePhone || !inviteName) {
      toast.error('Phone number and name are required');
      return;
    }

    try {
      setInviting(true);

      // Send invite to create account
      await apiClient.sendInvite({
        phone_number: invitePhone,
        name: inviteName,
        relationship: inviteRelationship,
        invited_by: userProfile?.id || 0
      });

      toast.success('Invitation sent successfully');
      setShowInviteDialog(false);
      setInvitePhone('');
      setInviteName('');
      setInviteRelationship('');
    } catch (error: any) {
      handleApiError(error, 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const removeFamilyMember = async (id: number) => {
    try {
      setSaving(true);

      // Remove from family members array
      const updatedFamily = family.filter(member => member.id !== id);
      setFamily(updatedFamily);
      
      // Update wedding project with new family details
      if (weddings.length > 0 && weddings[0].id) {
        await apiClient.updateWedding(weddings[0].id, {
          family_details: updatedFamily.map(({ id, ...rest }) => rest)
        });
      }
      
      toast.success('Family member removed successfully');
    } catch (error: any) {
      handleApiError(error, 'Failed to remove family member');
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'participant': return 'bg-blue-100 text-blue-800';
      case 'organizer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
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
        {error && (
          <ErrorMessage message={error} className="mb-6" />
        )}

        <div className="max-w-4xl mx-auto space-y-8">
          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="mt-8">
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <ProfileTab />
            )}

            {activeTab === 'weddings' && (
              <WeddingsTab user={user} weddings={weddings} setWeddings={setWeddings} />
            )}

            {activeTab === 'family' && (
              <FamilyMembersTab
                family={family}
                setShowAddFamily={setShowAddFamily}
                removeFamilyMember={removeFamilyMember}
                saving={saving}
                showAddFamily={showAddFamily}
                setShowInviteDialog={setShowInviteDialog}
                setNewFamilyMember={setNewFamilyMember}
                addFamilyMember={addFamilyMember}
                showInviteDialog={showInviteDialog}
                sendInvite={sendInvite}
                inviting={inviting}
                invitePhone={invitePhone}
                inviteName={inviteName}
                inviteRelationship={inviteRelationship}
                setInvitePhone={setInvitePhone}
                setInviteName={setInviteName}
                setInviteRelationship={setInviteRelationship}
                newFamilyMember={newFamilyMember}
                getRoleColor={getRoleColor}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 