'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Heart, Calendar, MapPin, Users, IndianRupee, 
  ShoppingCart, Bookmark, User as UserIcon, Plus, Edit,
  CheckCircle, Clock, AlertCircle, Loader2, Phone, Mail
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { apiClient, handleApiError, withLoading } from '@/lib/api-client';
import { toast } from 'sonner';
import { type WeddingProject } from '@/lib/types/ui';
import { type UserProfile } from '@/lib/types/api';
import DashboardHeader from './dashboard-header';
import WelcomeSection from './welcome-section';
import WeddingProjectsSection from './wedding-projects-section';
import QuickActionsSection from './quick-actions-section';
import ActiveProjectDetails from './active-project-details';

const quickActions = [
  { icon: ShoppingCart, label: 'Browse Vendors', href: '/vendors', color: 'bg-blue-500' },
  { icon: Bookmark, label: 'My Wishlist', href: '/wishlist', color: 'bg-purple-500' },
  { icon: Calendar, label: 'Book Visits', href: '/vendors', color: 'bg-green-500' },
  { icon: Users, label: 'Guest List', href: '/guests', color: 'bg-orange-500' }
];

export default function DashboardClient() {
  const router = useRouter();
  const { user: firebaseUser } = useAuth();
  useProtectedRoute();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [weddingProjects, setWeddingProjects] = useState<WeddingProject[]>([]);
  const [activeProject, setActiveProject] = useState<WeddingProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!firebaseUser) return;
    
    await withLoading(async () => {
      const token = await firebaseUser.getIdToken();
      apiClient.setToken(token);
      
      // Load user data
      const userData = (await apiClient.getCurrentUser()) as UserProfile;
      setUser(userData);

      // Load wedding projects
      const projectsData = (await apiClient.getWeddings()) as WeddingProject[];
      setWeddingProjects(projectsData);
      console.log('weddingData', projectsData)
      
      if (projectsData.length > 0) {
        setActiveProject(projectsData[0]);
      }
    }, setLoading);
  }, [firebaseUser]);

  useEffect(() => {
    if (firebaseUser) {
      loadDashboardData();
    }
  }, [firebaseUser, loadDashboardData]);

  const calculateProgress = (project: WeddingProject) => {
    // Simple progress calculation based on spent vs budget
    return Math.min(Math.round((project.spent / project.budget) * 100), 100);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return Clock;
      case 'partially booked': return AlertCircle;
      case 'booked': return CheckCircle;
      case 'completed': return CheckCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <WelcomeSection userName={user?.name} />

            <WeddingProjectsSection 
              weddingProjects={weddingProjects}
              activeProject={activeProject}
              projectsLoading={projectsLoading}
              setActiveProject={setActiveProject}
              calculateProgress={calculateProgress}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />

            <QuickActionsSection />

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Our team is here to assist you with your wedding planning journey.
                  Feel free to reach out to us.
                </p>
                <div className="flex items-center space-x-3 text-gray-700">
                  <a 
                    href="tel:+919013806803" 
                    className="hover:text-primary transition-colors flex items-center"
                    aria-label="Call support at +91 90138 06803"
                  >
                    <Phone className="w-5 h-5 text-primary" />
                  </a>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <a 
                    href="mailto:hello@forevernco.com" 
                    className="hover:text-primary transition-colors flex items-center"
                    aria-label="Email support at hello@forevernco.com"
                  >
                    <Mail className="w-5 h-5 text-primary" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content */}
          <div className="lg:col-span-1 space-y-8">
            {/* Profile Status */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Status</CardTitle>
              </CardHeader>
              <CardContent>
                {user ? (
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center">
                      <UserIcon className="w-5 h-5 mr-3 text-gray-500" />
                      <div>
                        <p className="font-medium">Name:</p>
                        <p>{user.name || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 mr-3 text-gray-500" />
                      <div>
                        <p className="font-medium">Email:</p>
                        <p>{user.email || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 mr-3 text-gray-500" />
                      <div>
                        <p className="font-medium">Phone:</p>
                        <p>{user.phone_number || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-gray-500" />
                      <div>
                        <p className="font-medium">Wedding Date:</p>
                        <p>{user.weddingDate ? new Date(user.weddingDate).toLocaleDateString() : 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-3 text-gray-500" />
                      <div>
                        <p className="font-medium">City:</p>
                        <p>{user.city || 'Not set'}</p>
                      </div>
                    </div>
                    <Link href="/profile">
                      <Button variant="outline" className="w-full">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">Profile data not available.</p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events/Tasks (Placeholder) */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3" />
                  <p>No upcoming events or tasks.</p>
                </div>
              </CardContent>
            </Card>

            {/* Tips for Planning (Placeholder) */}
            <Card>
              <CardHeader>
                <CardTitle>Planning Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Set a realistic budget and stick to it.</li>
                  <li>Start planning early to avoid last-minute stress.</li>
                  <li>Communicate clearly with all your vendors.</li>
                  <li>Don&apos;t forget to enjoy the process!</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <ActiveProjectDetails activeProject={activeProject} user={user} />
        </div>
      </div>
    </div>
  );
} 