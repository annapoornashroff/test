'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar, MapPin, Users, IndianRupee, Edit, Plus, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { type WeddingProject } from '@/lib/types/ui';

interface WeddingProjectsTabProps {
  projects: WeddingProject[];
  editingProject: number | null;
  setEditingProject: (projectId: number | null) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getProjectStatusColor: (status: string) => string;
  getProjectStatusIcon: (status: string) => React.ElementType;
}

export default function WeddingProjectsTab({
  projects,
  editingProject,
  setEditingProject,
  formatCurrency,
  formatDate,
  getProjectStatusColor,
  getProjectStatusIcon,
}: WeddingProjectsTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Wedding Projects</CardTitle>
        <Link href="/planning">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
            <p>No wedding projects found. Start planning your dream wedding!</p>
            <Link href="/planning">
              <Button className="mt-4">Create First Project</Button>
            </Link>
          </div>
        ) : (
          projects.map((project) => {
            const StatusIcon = getProjectStatusIcon(project.status);
            const statusColor = getProjectStatusColor(project.status);
            return (
              <Card key={project.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" /> {formatDate(project.date)}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" /> {project.city}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                      <StatusIcon className="w-3 h-3 mr-1 inline-block" /> {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProject(project.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" /> Guests: {project.estimated_guests}
                  </div>
                  <div className="flex items-center">
                    <IndianRupee className="w-4 h-4 mr-2" /> Budget: {formatCurrency(project.budget)}
                  </div>
                  <div className="flex items-center">
                    <IndianRupee className="w-4 h-4 mr-2" /> Spent: {formatCurrency(project.spent)}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </CardContent>
    </Card>
  );
} 