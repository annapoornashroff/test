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

interface WeddingProjectsSectionProps {
  weddingProjects: WeddingProject[];
  activeProject: WeddingProject | null;
  projectsLoading: boolean;
  setActiveProject: (project: WeddingProject) => void;
  calculateProgress: (project: WeddingProject) => number;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ElementType;
}

export default function WeddingProjectsSection({
  weddingProjects,
  activeProject,
  projectsLoading,
  setActiveProject,
  calculateProgress,
  getStatusColor,
  getStatusIcon,
}: WeddingProjectsSectionProps) {
  return (
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
                      {project.city}
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
  );
} 