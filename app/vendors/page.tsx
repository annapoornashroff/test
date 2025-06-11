'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, Filter, MapPin, Star, Heart, Calendar,
  Camera, Utensils, Palette, Music, Sparkles, Home, Loader2, Car, Cake, Gift
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient, handleApiError, withLoading } from '@/lib/api-client';
import { toast } from 'sonner';
import { useCity } from '@/lib/city-context';
import { type Vendor, type ApiResponse, type CategoriesResponse, type CitiesResponse } from '@/lib/types/ui';

interface Vendor {
  id: number;
  name: string;
  category: string;
  city: string;
  rating: number;
  review_count: number;
  price_min: number;
  price_max: number;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  contact_phone: string;
  contact_email: string;
}

interface ApiResponse<T> {
  data: T;
  error?: string;
}

interface CategoriesResponse {
  categories: string[];
}

interface CitiesResponse {
  cities: string[];
}

const categoryIcons: Record<string, any> = {
  'Photography': Camera,
  'Catering': Utensils,
  'Decoration': Palette,
  'Music & DJ': Music,
  'Makeup': Sparkles,
  'Venues': Home,
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { selectedCity, setSelectedCity } = useCity();
  const [priceRange, setPriceRange] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const searchVendors = useCallback(async () => {
    await withLoading(async () => {
      const params: Record<string, string> = {};
      
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedCity !== 'All') params.city = selectedCity;
      
      const vendorsData = await apiClient.getVendors(params) as Vendor[];
      setVendors(vendorsData);
    }, setSearchLoading);
  }, [searchQuery, selectedCategory, selectedCity]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchVendors();
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchVendors]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await withLoading(async () => {
      // Load vendors
      const vendorsData = await apiClient.getVendors() as Vendor[];
      setVendors(vendorsData);

      // Load categories
      const categoriesData = await apiClient.getVendorCategories() as CategoriesResponse;
      setCategories(categoriesData.categories || []);

      // Load cities
      const citiesData = await apiClient.getVendorLocations() as CitiesResponse;
      setCities(citiesData.cities || []);
    }, setLoading);
  };

  const addToWishlist = async (vendorId: number) => {
    try {
      // This would typically add to wishlist via API
      toast.success('Added to wishlist!');
    } catch (error) {
      handleApiError(error, 'Failed to add to wishlist');
    }
  };

  const formatPrice = (vendor: Vendor) => {
    if (vendor.price_min && vendor.price_max) {
      return `₹${vendor.price_min.toLocaleString('en-IN')} - ₹${vendor.price_max.toLocaleString('en-IN')}`;
    } else if (vendor.price_min) {
      return `Starting from ₹${vendor.price_min.toLocaleString('en-IN')}`;
    }
    return 'Price on request';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-gold">Forever & Co.</h1>
                <p className="text-xs text-gold-600 uppercase tracking-wider">Your One-Stop Wedding Wonderland</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/wishlist">
                <Button variant="gold-outline" size="sm" className="rounded-full">
                  <Heart className="w-4 h-4 mr-2" />
                  Wishlist
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="gold" size="sm" className="rounded-full">
                  Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Find Your Perfect Vendors
          </h2>
          <p className="text-gray-600">
            Browse through our curated network of premium wedding service providers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search vendors, services, or cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-6"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-lg px-3"
                >
                  <option value="All">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-lg px-3"
                >
                  <option value="All">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-lg px-3"
                >
                  <option value="All">All Prices</option>
                  <option value="Budget">Budget Friendly</option>
                  <option value="Mid">Mid Range</option>
                  <option value="Premium">Premium</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Categories Grid */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category] || Camera;
              const vendorCount = vendors.filter(v => v.category === category && (selectedCity === 'All' || v.city === selectedCity)).length;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                    selectedCategory === category
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 hover:border-primary'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedCategory === category ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{category}</p>
                      <p className="text-xs text-gray-500">{vendorCount} vendors</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {vendors.length} Vendors Found
            </h3>
            {searchQuery && (
              <p className="text-gray-600">Results for &quot;{searchQuery}&quot;</p>
            )}
          </div>
          
          <select className="border border-gray-300 rounded-lg px-3 py-2">
            <option>Sort by Relevance</option>
            <option>Highest Rated</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Most Reviews</option>
          </select>
        </div>

        {/* Vendors Grid */}
        {searchLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">Searching vendors...</p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedCity('All');
                setPriceRange('All');
              }}
              className="bg-primary hover:bg-primary-600"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Card key={vendor.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="relative h-48">
                  <Image
                    src={vendor.images[0]}
                    alt={vendor.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => addToWishlist(vendor.id)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  >
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{vendor.name}</h3>
                      <p className="text-sm text-gold font-medium">{vendor.category}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{vendor.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {vendor.city}
                    <span className="mx-2">•</span>
                    {vendor.review_count} reviews
                  </div>

                  <p className="text-sm text-gray-900 font-medium mb-4">{formatPrice(vendor)}</p>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      disabled={!vendor.is_active}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Visit
                    </Button>
                    <Link href={`/vendors/${vendor.id}`} className="flex-1">
                      <Button size="sm" className="w-full bg-primary hover:bg-primary-600">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {vendors.length > 0 && vendors.length % 12 === 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Vendors
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}