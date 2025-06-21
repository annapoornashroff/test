'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Edit, Save, X, Phone } from 'lucide-react';
import { UserProfile } from '@/lib/types/api';
import { SUPPORTED_CITIES } from '@/lib/constants';
import { apiClient, handleApiError } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';


export default function ProfileTab() {
  const { userProfile, refreshUserProfile } = useAuth();
  const [editingPersonal, setEditingPersonal] = React.useState(false);
  const [editedProfile, setEditedProfile] = React.useState<UserProfile | null>(null);
  const [saving, setSaving] = React.useState(false);


  const startEditing = () => {
    setEditedProfile(userProfile ? { ...userProfile } : null);
    setEditingPersonal(true);
  };

  const cancelEditing = () => {
    setEditedProfile(null);
    setEditingPersonal(false);
  };

  const savePersonalInfo = async () => {
    if (!editedProfile) return;
    try {
      setSaving(true);
      await apiClient.updateUser({
        name: editedProfile.name,
        email: editedProfile.email,
        city: editedProfile.city
      });
      await refreshUserProfile();
      setEditingPersonal(false);
      setEditedProfile(null);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      handleApiError(error, 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const profile = editingPersonal && editedProfile ? editedProfile : userProfile;

  return (userProfile?
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Personal Information</CardTitle>
        {!editingPersonal ? (
          <Button variant="outline" size="sm" onClick={startEditing}>
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={cancelEditing}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button size="sm" onClick={savePersonalInfo} disabled={saving}>
              {saving ? <span className="flex items-center"><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>Saving...</span> : <><Save className="w-4 h-4 mr-2" /> Save</>}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Full Name
          </label>
          <Input
            value={profile?.name || ''}
            onChange={editingPersonal ? (e) => setEditedProfile(p => p ? { ...p, name: e.target.value } : p) : undefined}
            readOnly={!editingPersonal}
            className={!editingPersonal ? 'border-transparent bg-transparent shadow-none' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Address
          </label>
          <Input
            value={profile?.email || ''}
            onChange={editingPersonal ? (e) => setEditedProfile(p => p ? { ...p, email: e.target.value } : p) : undefined}
            readOnly={!editingPersonal}
            className={!editingPersonal ? 'border-transparent bg-transparent shadow-none' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number
          </label>
          <Input
            value={profile?.phone_number || ''}
            readOnly
            className="border-transparent bg-transparent shadow-none text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <select
            value={profile?.city || ''}
            onChange={editingPersonal ? (e) => setEditedProfile(p => p ? { ...p, city: (e.target.value as (typeof SUPPORTED_CITIES)[number]) } : p) : undefined}
            className="w-full h-12 border border-gray-300 rounded-lg px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={!editingPersonal}
          >
            <option value="">Select a city</option>
            {SUPPORTED_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  : null);
} 