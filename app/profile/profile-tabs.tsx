'use client';

import { Button } from '@/components/ui/button';
import { User, Heart, Users } from 'lucide-react';

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function ProfileTabs({ activeTab, setActiveTab }: ProfileTabsProps) {
  return (
    <div className="flex justify-center space-x-4 mb-8">
      <Button
        variant={activeTab === 'personal' ? 'secondary' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('personal')}
      >
        <User className="w-4 h-4 mr-2" /> Personal Info
      </Button>
      <Button
        variant={activeTab === 'projects' ? 'secondary' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('projects')}
      >
        <Heart className="w-4 h-4 mr-2" /> Wedding Projects
      </Button>
      <Button
        variant={activeTab === 'family' ? 'secondary' : 'ghost'}
        className="w-full justify-start"
        onClick={() => setActiveTab('family')}
      >
        <Users className="w-4 h-4 mr-2" /> Family Members
      </Button>
    </div>
  );
} 