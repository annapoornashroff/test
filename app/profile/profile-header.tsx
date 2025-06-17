import { Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfileHeader() {
  return (
    <header className="relative z-10 p-6">
      <Link href="/dashboard" className="flex items-center space-x-3 text-white hover:text-white/80 transition-colors">
        <ArrowLeft className="w-6 h-6" />
        <span>Back to Dashboard</span>
      </Link>
    </header>
  );
} 