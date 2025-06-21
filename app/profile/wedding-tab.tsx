'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar, MapPin, Users, IndianRupee, Edit, Plus, Loader2,
  Plane,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { type WeddingData } from '@/lib/types/api';
import { User } from 'firebase/auth';


export default function WeddingsTab({
  weddings
}: {
  weddings: WeddingData[],
}) {
  const [editing, setEditing] = React.useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLANNING': return Plane;
      case 'ACTIVE': return CheckCircle;
      case 'COMPLETED': return CheckCircle;
      case 'CANCELLED': return XCircle;
      default: return Clock;
    }
  };

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
        {weddings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
            <p>No wedding projects found. Start planning your dream wedding!</p>
            <Link href="/planning">
              <Button className="mt-4">Create First Project</Button>
            </Link>
          </div>
        ) : (
          weddings.map((wedding: WeddingData) => {
            const StatusIcon = getStatusIcon(wedding.status);
            const statusColor = getStatusColor(wedding.status);
            return (
              <Card key={wedding.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{wedding.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" /> {formatDate(wedding.date)}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" /> {wedding.cities}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                      <StatusIcon className="w-3 h-3 mr-1 inline-block" /> {wedding.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => wedding.id? setEditing(wedding.id): null}
                      >
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" /> Guests: {wedding.estimated_guests}
                  </div>
                  <div className="flex items-center">
                    <IndianRupee className="w-4 h-4 mr-2" /> Budget: {formatCurrency(wedding.budget)}
                  </div>
                  <div className="flex items-center">
                    <IndianRupee className="w-4 h-4 mr-2" /> Spent: {wedding.spent? formatCurrency(wedding.spent): 0}
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