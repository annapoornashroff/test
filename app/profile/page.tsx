'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { 
  User, Heart, Edit, Save, X, Calendar, MapPin, 
  Users, IndianRupee, Phone, Mail, Plus, Trash2, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { apiClient, handleApiError } from '@/lib/api-client';
import { toast } from 'sonner';

interface FamilyMember {
  id: number;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  role: 'decision_maker' | 'participant' | 'observer';
}

interface WeddingProject {
  id: number;
  name: string;
  date: string;
  location: string;
  estimated_guests: number;
  budget: number;
  spent: number;
  status: 'planning' | 'partially_booked' | 'booked' | 'completed';
  events: string[];
  family_details: FamilyMember[];
}

interface PersonalInfo {
  name: string;
  phoneNumber: string;
  email: string;
  location: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const [showAddFamily, setShowAddFamily] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    phoneNumber: '',
    email: '',
    location: ''
  });

  const [projects, setProjects] = useState<WeddingProject[]>([]);
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [newFamilyMember, setNewFamilyMember] = useState<Omit<FamilyMember, 'id'>>({
    name: '',
    relationship: '',
    phoneNumber: '',
    email: '',
    role: 'participant'
  });

  const { user } = useAuth();
  useProtectedRoute();

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const token = await user.getIdToken();
      
      // Load user profile
      const userProfile = await apiClient.getCurrentUser() as {
        name?: string;
        phone_number?: string;
        email?: string;
        location?: string;
      };
      setPersonalInfo({
        name: userProfile.name || '',
        phoneNumber: userProfile.phone_number || '',
        email: userProfile.email || '',
        location: userProfile.location || ''
      });
      
      // Load wedding projects
      const weddingProjects = await apiClient.getWeddings() as WeddingProject[];
      setProjects(weddingProjects);
      
      // Load family members (from the first wedding project if available)
      if (weddingProjects.length > 0) {
        const familyDetails = weddingProjects[0].family_details || [];
        setFamily(familyDetails.map((member: any, index: number) => ({
          id: index + 1,
          ...member
        })));
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
      setError(error.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  const savePersonalInfo = async () => {
    try {
      setSaving(true);
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const token = await user.getIdToken();
      
      await apiClient.updateUser({
        name: personalInfo.name,
        email: personalInfo.email,
        location: personalInfo.location
      });
      
      setEditingPersonal(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      handleApiError(error, 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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
      
      // Add to family members array
      const updatedFamily = [...family, {
        id: family.length + 1,
        ...newFamilyMember
      }];
      
      setFamily(updatedFamily);
      
      // Update wedding project with new family details
      if (projects.length > 0) {
        const token = await user.getIdToken();
        await apiClient.updateWedding(projects[0].id, {
          family_details: updatedFamily.map(({ id, ...rest }) => rest)
        });
      }
      
      setNewFamilyMember({
        name: '',
        relationship: '',
        phoneNumber: '',
        email: '',
        role: 'participant'
      });
      
      setShowAddFamily(false);
      toast.success('Family member added successfully');
    } catch (error: any) {
      handleApiError(error, 'Failed to add family member');
    } finally {
      setSaving(false);
    }
  };

  const removeFamilyMember = async (id: number) => {
    try {
      setSaving(true);
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Remove from family members array
      const updatedFamily = family.filter(member => member.id !== id);
      setFamily(updatedFamily);
      
      // Update wedding project with new family details
      if (projects.length > 0) {
        const token = await user.getIdToken();
        await apiClient.updateWedding(projects[0].id, {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'text-blue-600 bg-blue-50';
      case 'partially booked': return 'text-orange-600 bg-orange-50';
      case 'booked': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'decision_maker': return 'text-purple-600 bg-purple-50';
      case 'participant': return 'text-blue-600 bg-blue-50';
      case 'observer': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
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
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            My Profile
          </h2>
          <p className="text-gray-600">
            Manage your account settings and wedding projects
          </p>
        </div>

        {error && (
          <ErrorMessage message={error} className="mb-6" />
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'personal' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'projects' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Wedding Projects
          </button>
          <button
            onClick={() => setActiveTab('family')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'family' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Family Details
          </button>
        </div>

        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
              {!editingPersonal ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingPersonal(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    size="sm"
                    onClick={savePersonalInfo}
                    className="bg-primary hover:bg-primary-600"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingPersonal(false)}
                    disabled={saving}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {editingPersonal ? (
                    <Input
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
                      disabled={saving}
                    />
                  ) : (
                    <p className="text-gray-900">{personalInfo.name || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {editingPersonal ? (
                    <Input
                      value={personalInfo.phoneNumber}
                      disabled={true}
                      className="bg-gray-100"
                    />
                  ) : (
                    <p className="text-gray-900">{personalInfo.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  {editingPersonal ? (
                    <Input
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                      disabled={saving}
                    />
                  ) : (
                    <p className="text-gray-900">{personalInfo.email || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  {editingPersonal ? (
                    <Input
                      value={personalInfo.location}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, location: e.target.value }))}
                      disabled={saving}
                    />
                  ) : (
                    <p className="text-gray-900">{personalInfo.location || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wedding Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Wedding Projects</h3>
              <Link href="/planning">
                <Button className="bg-primary hover:bg-primary-600 rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </Link>
            </div>

            {projects.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No wedding projects yet</h3>
                  <p className="text-gray-600 mb-6">Start planning your dream wedding today</p>
                  <Link href="/planning">
                    <Button className="bg-primary hover:bg-primary-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Project
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              projects.map((project: any) => (
                <Card key={project.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">{project.name}</h4>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(project.status)}`}>
                          {project.status.replace('_', ' ')}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(project.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {project.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {project.estimated_guests} guests
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <IndianRupee className="w-4 h-4 mr-2" />
                        {formatCurrency(project.budget)}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round((project.spent / project.budget) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.round((project.spent / project.budget) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Events:</p>
                      <div className="flex flex-wrap gap-2">
                        {(project.events || []).map((event: string, index: number) => (
                          <span key={index} className="text-xs bg-gold-50 text-gold-700 px-2 py-1 rounded-full">
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <div className="text-sm">
                        <span className="text-gray-600">Spent: </span>
                        <span className="font-medium">{formatCurrency(project.spent)}</span>
                        <span className="text-gray-600"> / {formatCurrency(project.budget)}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link href="/cart">
                          <Button size="sm" variant="outline">
                            View Cart
                          </Button>
                        </Link>
                        <Link href="/guests">
                          <Button size="sm" className="bg-primary hover:bg-primary-600">
                            Manage Guests
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Family Details Tab */}
        {activeTab === 'family' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Family Members</h3>
              <Button 
                onClick={() => setShowAddFamily(true)}
                className="bg-primary hover:bg-primary-600 rounded-full"
                disabled={saving}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Family Member
              </Button>
            </div>

            {/* Add Family Member Form */}
            {showAddFamily && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Family Member</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Full Name *"
                      value={newFamilyMember.name}
                      onChange={(e) => setNewFamilyMember(prev => ({ ...prev, name: e.target.value }))}
                      disabled={saving}
                    />
                    <Input
                      placeholder="Relationship *"
                      value={newFamilyMember.relationship}
                      onChange={(e) => setNewFamilyMember(prev => ({ ...prev, relationship: e.target.value }))}
                      disabled={saving}
                    />
                    <Input
                      placeholder="Phone Number *"
                      value={newFamilyMember.phoneNumber}
                      onChange={(e) => setNewFamilyMember(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      disabled={saving}
                    />
                    <Input
                      placeholder="Email Address"
                      value={newFamilyMember.email}
                      onChange={(e) => setNewFamilyMember(prev => ({ ...prev, email: e.target.value }))}
                      disabled={saving}
                    />
                    <select
                      value={newFamilyMember.role}
                      onChange={(e) => {
                        const role = e.target.value as 'decision_maker' | 'participant' | 'observer';
                        setNewFamilyMember(prev => ({ ...prev, role }));
                      }}
                      className="h-10 border border-gray-300 rounded-lg px-3"
                      disabled={saving}
                    >
                      <option value="decision_maker">Decision Maker</option>
                      <option value="participant">Participant</option>
                      <option value="observer">Observer</option>
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      onClick={addFamilyMember} 
                      className="bg-primary hover:bg-primary-600"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Member
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddFamily(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Family Members List */}
            <div className="space-y-4">
              {family.map((member: any) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h4 className="font-semibold text-lg">{member.name}</h4>
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                            {member.relationship}
                          </span>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            {member.role.replace('_', ' ')}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {member.phoneNumber}
                          </div>
                          {member.email && (
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {member.email}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => removeFamilyMember(member.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {family.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No family members added</h3>
                  <p className="text-gray-600 mb-6">Add family members who will be involved in wedding planning</p>
                  <Button 
                    onClick={() => setShowAddFamily(true)}
                    className="bg-primary hover:bg-primary-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Family Member
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}