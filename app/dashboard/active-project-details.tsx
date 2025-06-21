'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar, MapPin, Users, IndianRupee,
  Phone, Mail, Loader2, Edit, User as UserIcon
} from 'lucide-react';
import Link from 'next/link';
import { type UserProfile, type WeddingData } from '@/lib/types/api';

interface ActiveProjectDetailsProps {
  activeProject: WeddingData | null;
  user: UserProfile | null;
}

export default function ActiveProjectDetails({
  activeProject,
  user,
}: ActiveProjectDetailsProps) {
  if (!activeProject) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Select a project to view details...</p>
      </div>
    );
  }

  return (
    <div className="lg:col-span-1 space-y-8">
      {/* Active Project Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Project Details</CardTitle>
          <Link href={`/planning?projectId=${activeProject.id}`}>
            <Button size="sm" variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Project
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-700">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-3 text-gray-500" />
            <span>Event Date: {new Date(activeProject.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-3 text-gray-500" />
            <span>Location: {activeProject.cities}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-3 text-gray-500" />
            <span>Guests: {activeProject.estimated_guests}</span>
          </div>
          <div className="flex items-center">
            <IndianRupee className="w-4 h-4 mr-3 text-gray-500" />
            <span>Budget: ₹{activeProject.budget.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center">
            <IndianRupee className="w-4 h-4 mr-3 text-gray-500" />
            <span>Spent: ₹{activeProject.spent?.toLocaleString('en-IN')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-700">
          <div className="flex items-center">
            <UserIcon className="w-4 h-4 mr-3 text-gray-500" />
            <span>{user?.name || 'N/A'}</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-3 text-gray-500" />
            <span>{user?.phone_number || 'N/A'}</span>
          </div>
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-3 text-gray-500" />
            <span>{user?.email || 'N/A'}</span>
          </div>
          <div className="pt-4 border-t mt-4">
            <Button className="w-full" variant="outline">
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 