'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Download, Send, Phone, Mail, Check, X, Clock, Edit, Trash2 } from 'lucide-react';
import { type GuestResponse } from '@/lib/types/api';
import React from 'react';

interface GuestListTableProps {
  filteredGuests: GuestResponse[];
  sendInvitation: (guestId: number) => Promise<void>;
  updateConfirmationStatus: (guestId: number, status: string) => Promise<void>;
  removeGuest: (guestId: number) => Promise<void>;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ElementType;
}

export default function GuestListTable({
  filteredGuests,
  sendInvitation,
  updateConfirmationStatus,
  removeGuest,
  getStatusColor,
  getStatusIcon,
}: GuestListTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Guests ({filteredGuests.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {filteredGuests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No guests found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuests.map((guest) => {
                  const StatusIcon = getStatusIcon(guest.confirmation_status);
                  return (
                    <tr key={guest.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {guest.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          {guest.phone_number && (
                            <a href={`tel:${guest.phone_number}`} className="flex items-center text-blue-600 hover:text-blue-800">
                              <Phone className="w-4 h-4 mr-1" /> {guest.phone_number}
                            </a>
                          )}
                          {guest.email && (
                            <a href={`mailto:${guest.email}`} className="flex items-center text-blue-600 hover:text-blue-800">
                              <Mail className="w-4 h-4 mr-1" /> {guest.email}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {guest.category || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(guest.confirmation_status)}`}>
                          <StatusIcon className="w-3 h-3 mr-1" /> {guest.confirmation_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => sendInvitation(guest.id)}
                            disabled={guest.invitation_sent}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {guest.invitation_sent ? 'Sent' : 'Send Invite'}
                          </Button>
                          {guest.confirmation_status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => updateConfirmationStatus(guest.id, 'confirmed')}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Check className="w-4 h-4 mr-2" /> Confirm
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => updateConfirmationStatus(guest.id, 'declined')}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4 mr-2" /> Decline
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => removeGuest(guest.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 