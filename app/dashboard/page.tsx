'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Heart, Calendar, MapPin, Users, IndianRupee, 
  ShoppingCart, Bookmark, User, Plus, Edit,
  CheckCircle, Clock, AlertCircle, Loader2, Phone, Mail
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient, handleApiError, withLoading } from '@/lib/api-client';
import { toast } from 'sonner';

interface WeddingProject {
  id: number;
  name: string;
  date: string;
  location: string;
  status: string;
  budget: number;
  spent: number;
  estimated_guests: number;
  events: string[];
}

interface User {
  id: number;
  name: string;
  phone_number: string;
  email: string;
  location: string;
}

const quickActions = [
  { icon: ShoppingCart, label: 'Browse Vendors', href: '/vendors', color: 'bg-blue-500' },
  { icon: Bookmark, label: 'My Wishlist', href: '/wishlist', color: 'bg-purple-500' },
  { icon: Calendar, label: 'Book Visits', href: '/vendors', color: 'bg-green-500' },
  { icon: Users, label: 'Guest List', href: '/guests', color: 'bg-orange-500' }
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [weddingProjects, setWeddingProjects] = useState<WeddingProject[]>([]);
  const [activeProject, setActiveProject] = useState<WeddingProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    await withLoading(async () => {
      // Load user data
      const userData = await apiClient.getCurrentUser();
      setUser(userData);

      // Load wedding projects
      const projectsData = await apiClient.getWeddings();
      setWeddingProjects(projectsData);
      
      if (projectsData.length > 0) {
        setActiveProject(projectsData[0]);
      }
    }, setLoading);
  };

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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-gold">Forever & Co.</h1>
                <p className="text-xs text-gold-600 uppercase tracking-wider">Your One-Stop Wedding Wonderland</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/cart">
                <Button variant="outline" size="sm" className="rounded-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="gold" size="sm" className="rounded-full">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Section */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                Welcome back, {user?.name || 'there'}! 👋
              </h2>
              <p className="text-gray-600">
                Let's continue planning your dream wedding
              </p>
            </div>

            {/* Wedding Projects */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Wedding Projects</CardTitle>
                <Link href="/planning">
                  <Button size="sm" variant="gold">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-gray-600">Loading projects...</p>
                  </div>
                ) : weddingProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No wedding projects yet</h3>
                    <p className="text-gray-600 mb-6">Start planning your dream wedding today!</p>
                    <Link href="/planning">
                      <Button className="bg-primary hover:bg-primary-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Project
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {weddingProjects.map((project) => {
                      const StatusIcon = getStatusIcon(project.status);
                      const progress = calculateProgress(project);
                      
                      return (
                        <div 
                          key={project.id}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            activeProject?.id === project.id 
                              ? 'border-primary bg-primary-50' 
                              : 'border-gray-200 hover:border-primary'
                          }`}
                          onClick={() => setActiveProject(project)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-lg">{project.name}</h3>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(project.status)}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {project.status.replace('_', ' ')}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {new Date(project.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {project.location}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-3 pt-3 border-t">
                            <div className="text-sm">
                              <span className="text-gray-600">Budget: </span>
                              <span className="font-medium">₹{project.budget.toLocaleString('en-IN')}</span>
                            </div>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <div className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer group">
                        <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">{action.label}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Overview */}
            {activeProject && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {calculateProgress(activeProject)}%
                    </div>
                    <p className="text-sm text-gray-600">Complete</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Budget Used</span>
                      <span className="text-sm font-medium">
                        ₹{activeProject.spent.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Remaining</span>
                      <span className="text-sm font-medium text-green-600">
                        ₹{(activeProject.budget - activeProject.spent).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <Link href="/cart">
                    <Button className="w-full bg-primary hover:bg-primary-600">
                      View Cart
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* User Info */}
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{user.phone_number}</span>
                  </div>
                  {user.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{user.location}</span>
                    </div>
                  )}
                  <Link href="/profile">
                    <Button variant="outline" className="w-full mt-4">
                      Edit Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}