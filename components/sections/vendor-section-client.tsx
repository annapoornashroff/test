'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, ArrowRight, Star, MapPin, Camera, Utensils, Palette } from 'lucide-react';
import Image from 'next/image';
import { useNavigation } from '@/lib/navigation-context';
import { SUPPORTED_CITIES } from '@/lib/constants';

const categories = [
  { name: 'Photography', icon: Camera, color: 'bg-blue-500' },
  { name: 'Catering', icon: Utensils, color: 'bg-green-500' },
  { name: 'Decoration', icon: Palette, color: 'bg-purple-500' },
];

const featuredVendors = [
  {
    id: 1,
    name: 'Royal Palace',
    category: 'Venue',
    rating: 4.8,
    reviews: 128,
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg',
    city: SUPPORTED_CITIES[0], // Mumbai
    price: '₹2,00,000 onwards'
  },
  {
    id: 2,
    name: 'Delhi Delights',
    category: 'Catering',
    rating: 4.9,
    reviews: 256,
    image: 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg',
    city: SUPPORTED_CITIES[1], // Delhi
    price: '₹1,500 per plate'
  },
  {
    id: 3,
    name: 'Bangalore Bliss',
    category: 'Decoration',
    rating: 4.7,
    reviews: 89,
    image: 'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg',
    city: SUPPORTED_CITIES[1], // Bangalore
    price: '₹3,00,000 onwards'
  }
];

export default function VendorSectionClient() {
  const { navigate } = useNavigation();

  const handleViewDetails = async (vendorId: number) => {
    await navigate(`/vendors/${vendorId}`);
  };

  const handleAddToCart = async (vendorId: number) => {
    // TODO: Implement add to cart functionality
    console.log('Adding vendor to cart:', vendorId);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-between mb-8">
            <Button variant="gold" className="rounded-full">
              <Filter className="w-5 h-5 mr-2" />
              CATEGORY
            </Button>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary">
              LOOKING FOR VENDORS?
            </h2>
            <Button variant="gold" className="rounded-full">
              <Filter className="w-5 h-5 mr-2" />
              FILTER / SORT
            </Button>
          </div>
        </div>

        {/* Vendor Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {featuredVendors.map((vendor) => (
            <Card key={vendor.id} className="bg-pink-100 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={vendor.image}
                  alt={vendor.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-bold">{vendor.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{vendor.city}</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 rounded-full px-3 py-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold">{vendor.rating}</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gold bg-gold-50 px-2 py-1 rounded-full">
                    {vendor.category}
                  </span>
                  <span className="text-xs text-gray-500">{vendor.reviews} reviews</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{vendor.price}</p>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleViewDetails(vendor.id)}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant="gold" 
                    className="flex-1"
                    onClick={() => handleAddToCart(vendor.id)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            variant="primary" 
            size="lg" 
            className="rounded-full"
            onClick={() => navigate('/vendors')}
          >
            VIEW ALL
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
} 