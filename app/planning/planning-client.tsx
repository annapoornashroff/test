'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { WeddingDetailsForm } from '@/app/components/forms/WeddingDetailsForm';


export default function PlanningClient() {
  const router = useRouter();
  const { userProfile } = useAuth();
  useProtectedRoute();
  
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gold-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-gold">Forever & Co.</h1>
              <p className="text-xs text-gold-600 uppercase tracking-wider">Your One-Stop Wedding Wonderland</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
              Plan Your Dream Wedding
            </h1>
            <p className="text-lg text-gray-600">
              Tell us about your special day and we&apos;ll create the perfect plan for you
            </p>
          </div>

          {/* Planning Form */}
          <Card className="bg-white rounded-3xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-center">Wedding Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <WeddingDetailsForm
                userProfile={userProfile}
                loading={loading}
                submitLabel="Start Planning"
                setLoading={setLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 