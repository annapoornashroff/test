'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Mail, Phone, Plus, Trash2, Send, Users, Loader2 } from 'lucide-react';
import { type FamilyMember } from '@/lib/types/ui';

interface FamilyMembersTabProps {
  family: FamilyMember[];
  setShowAddFamily: (show: boolean) => void;
  removeFamilyMember: (id: number) => Promise<void>;
  saving: boolean;
  showAddFamily: boolean;
  setShowInviteDialog: (show: boolean) => void;
  setNewFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  addFamilyMember: () => Promise<void>;
  showInviteDialog: boolean;
  sendInvite: () => Promise<void>;
  inviting: boolean;
  invitePhone: string;
  inviteName: string;
  inviteRelationship: string;
  setInvitePhone: (phone: string) => void;
  setInviteName: (name: string) => void;
  setInviteRelationship: (relationship: string) => void;
  newFamilyMember: Omit<FamilyMember, 'id'>;
  getRoleColor: (role: string) => string;
}

export default function FamilyMembersTab({
  family,
  setShowAddFamily,
  removeFamilyMember,
  saving,
  showAddFamily,
  setShowInviteDialog,
  setNewFamilyMember,
  addFamilyMember,
  showInviteDialog,
  sendInvite,
  inviting,
  invitePhone,
  inviteName,
  inviteRelationship,
  setInvitePhone,
  setInviteName,
  setInviteRelationship,
  newFamilyMember,
  getRoleColor,
}: FamilyMembersTabProps) {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Family Members</CardTitle>
          <Button size="sm" onClick={() => setShowAddFamily(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Member
          </Button>
        </CardHeader>
        <CardContent>
          {family.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4" />
              <p>No family members added yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {family.map((member) => {
                const RoleColor = getRoleColor(member.role);
                return (
                  <Card key={member.id} className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.relationship}</p>
                        {member.phoneNumber && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Phone className="w-3 h-3 mr-1" /> {member.phoneNumber}
                          </p>
                        )}
                        {member.email && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Mail className="w-3 h-3 mr-1" /> {member.email}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${RoleColor}`}>
                          {member.role}
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFamilyMember(member.id)}
                          disabled={saving}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Family Member Dialog */}
      <Dialog open={showAddFamily} onOpenChange={setShowAddFamily}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Family Member</DialogTitle>
            <DialogDescription>
              Enter details for a new family member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <Input
                id="name"
                value={newFamilyMember.name}
                onChange={(e) => setNewFamilyMember({ ...newFamilyMember, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="phoneNumber" className="text-right">
                Phone
              </label>
              <Input
                id="phoneNumber"
                value={newFamilyMember.phoneNumber}
                onChange={(e) => setNewFamilyMember({ ...newFamilyMember, phoneNumber: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={newFamilyMember.email}
                onChange={(e) => setNewFamilyMember({ ...newFamilyMember, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="relationship" className="text-right">
                Relationship
              </label>
              <Input
                id="relationship"
                value={newFamilyMember.relationship}
                onChange={(e) => setNewFamilyMember({ ...newFamilyMember, relationship: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="role" className="text-right">
                Role
              </label>
              <Select
                value={newFamilyMember.role}
                onValueChange={(value) => setNewFamilyMember({ ...newFamilyMember, role: value as 'PARTICIPANT' | 'ORGANIZER' })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participant">Participant</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={addFamilyMember} disabled={saving}>
            {saving ? <span className="flex items-center"><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>Adding...</span> : 'Add Member'}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              The user with this phone number does not exist. Send them an invite to join Forever & Co.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="invitePhone" className="text-right">
                Phone
              </label>
              <Input
                id="invitePhone"
                value={invitePhone}
                readOnly
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="inviteName" className="text-right">
                Name
              </label>
              <Input
                id="inviteName"
                value={inviteName}
                readOnly
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="inviteRelationship" className="text-right">
                Relationship
              </label>
              <Input
                id="inviteRelationship"
                value={inviteRelationship}
                readOnly
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={sendInvite} disabled={inviting}>
            {inviting ? <span className="flex items-center"><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>Sending Invite...</span> : <><Send className="w-4 h-4 mr-2" /> Send Invitation</>}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
