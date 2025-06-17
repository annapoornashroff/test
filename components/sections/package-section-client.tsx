'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Filter, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useNavigation } from '@/lib/navigation-context';
import { Loading } from '@/components/ui/loading';
import { useState } from 'react';

const packages = [
  {
    id: 1,
    name: 'Royal Wedding Package',
    price: '₹5,00,000',
    originalPrice: '₹7,00,000',
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg',
    features: ['Premium Venue', 'Professional Photography', 'Luxury Catering', 'Decoration']
  },
  {
    id: 2,
    name: 'Grand Celebration Package',
    price: '₹8,00,000',
    originalPrice: '₹12,00,000',
    image: 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg',
    features: ['Luxury Venue', 'Cinematic Video', 'Multi-Cuisine Catering', 'Theme Decoration']
  }
];

export default function PackageSectionClient() {
  const { navigate } = useNavigation();
  const [isCustomizing, setIsCustomizing] = useState<number | null>(null);

  const handleCustomizePackage = async (packageId: number) => {
    setIsCustomizing(packageId);
    try {
      await navigate(`/packages/${packageId}/customize`);
    } finally {
      setIsCustomizing(null);
    }
  };

  const handleCreatePackage = async () => {
    await navigate('/packages/create');
  };

  const handleViewAll = async () => {
    await navigate('/packages');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary-600 to-primary-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 indian-pattern opacity-20" />
      
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-32 h-32">
        <div className="w-full h-full border-l-4 border-t-4 border-white/30 rounded-tl-3xl" />
      </div>
      <div className="absolute top-0 right-0 w-32 h-32">
        <div className="w-full h-full border-r-4 border-t-4 border-white/30 rounded-tr-3xl" />
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32">
        <div className="w-full h-full border-l-4 border-b-4 border-white/30 rounded-bl-3xl" />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32">
        <div className="w-full h-full border-r-4 border-b-4 border-white/30 rounded-br-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="outline" 
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              onClick={handleCreatePackage}
            >
              <Plus className="w-5 h-5 mr-2" />
              CREATE A PACKAGE
            </Button>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">
              CUSTOMISE YOUR PACKAGE
            </h2>
            <div className="w-32" /> {/* Spacer for balance */}
          </div>
        </div>

        {/* Package Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={pkg.image}
                  alt={pkg.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{pkg.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-2xl font-bold">{pkg.price}</span>
                    <span className="text-sm line-through opacity-75">{pkg.originalPrice}</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-2">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-center">
                      <div className="w-2 h-2 bg-gold rounded-full mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-4 bg-primary hover:bg-primary-600"
                  onClick={() => handleCustomizePackage(pkg.id)}
                  disabled={isCustomizing === pkg.id}
                >
                  {isCustomizing === pkg.id ? (
                    <Loading size="sm" className="text-white" />
                  ) : (
                    'Customize Package'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={() => navigate('/packages?filter=true')}
          >
            <Filter className="w-5 h-5 mr-2" />
            FILTER / SORT
          </Button>
          <Button 
            variant="outline" 
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={handleViewAll}
          >
            VIEW ALL
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
} 