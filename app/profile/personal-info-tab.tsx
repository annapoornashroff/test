'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Edit, Save, X, Phone } from 'lucide-react';
import { type PersonalInfo } from '@/lib/types/ui';

interface PersonalInfoTabProps {
  personalInfo: PersonalInfo;
  editingPersonal: boolean;
  setEditingPersonal: (editing: boolean) => void;
  setPersonalInfo: (info: PersonalInfo) => void;
  savePersonalInfo: () => Promise<void>;
  saving: boolean;
}

export default function PersonalInfoTab({
  personalInfo,
  editingPersonal,
  setEditingPersonal,
  setPersonalInfo,
  savePersonalInfo,
  saving,
}: PersonalInfoTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Personal Information</CardTitle>
        {!editingPersonal ? (
          <Button variant="outline" size="sm" onClick={() => setEditingPersonal(true)}>
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setEditingPersonal(false)}>
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
            value={personalInfo.name}
            onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
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
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
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
            value={personalInfo.phoneNumber}
            readOnly
            className="border-transparent bg-transparent shadow-none text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <Input
            value={personalInfo.city}
            onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
            readOnly={!editingPersonal}
            className={!editingPersonal ? 'border-transparent bg-transparent shadow-none' : ''}
          />
        </div>
      </CardContent>
    </Card>
  );
} 