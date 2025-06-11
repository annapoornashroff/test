'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { 
  Heart, Star, Check, X, Edit, ShoppingCart, 
  Filter, Search, Plus, Minus, ArrowRight, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api';
import { type Vendor, type Package } from '@/lib/types/ui';

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [customizing, setCustomizing] = useState(false);
  const [customPackage, setCustomPackage] = useState<Package | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      const [packagesData, vendorsData] = await Promise.all([
        apiClient.getPackages(),
        apiClient.getVendors()
      ]);

      setPackages(packagesData as Package[]);
      setVendors(vendorsData as Vendor[]);
    } catch (error: any) {
      console.error('Error fetching packages:', error);
      setError(error.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const startCustomization = (pkg: Package) => {
    setSelectedPackage(pkg);
    setCustomPackage({
      ...pkg,
      vendors: [...(pkg.vendors || [])],
      customPrice: pkg.price
    });
    setCustomizing(true);
  };

  const swapVendor = (categoryToSwap: string, newVendorId: string) => {
    if (!customPackage) return;
    
    const newVendor = vendors.find((v) => v.id.toString() === newVendorId);
    if (!newVendor) return;

    const updatedVendors = customPackage.vendors?.map((vendor) => 
      vendor.category === categoryToSwap 
        ? { ...vendor, vendor_name: newVendor.name, vendor_id: newVendor.id }
        : vendor
    ) || [];

    // Recalculate price based on vendor changes
    const newPrice = updatedVendors.reduce((total, vendor) => {
      const vendorData = vendors.find((v) => v.id.toString() === vendor.vendor_id.toString());
      return total + (vendorData?.price_min || 0);
    }, 0);

    setCustomPackage({
      ...customPackage,
      vendors: updatedVendors,
      customPrice: newPrice
    });
  };

  const addToCart = (pkg: any) => {
    // Here we would normally add to cart via API
    console.log('Adding package to cart:', pkg);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredVendors = vendors.filter((vendor: any) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || vendor.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Venue', 'Photography', 'Catering', 'Decoration', 'Makeup'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading packages...</p>
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
              <Link href="/vendors">
                <Button variant="gold-outline" size="sm" className="rounded-full">
                  Browse Vendors
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="gold" size="sm" className="rounded-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {error && (
          <ErrorMessage message={error} className="mb-6" />
        )}

        {!customizing ? (
          <>
            {/* Page Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                Wedding Packages
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Choose from our curated wedding packages or customize your own perfect celebration
              </p>
            </div>

            {/* Package Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {packages.map((pkg: any) => (
                <Card key={pkg.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group relative">
                  {pkg.is_popular && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        POPULAR
                      </div>
                    </div>
                  )}
                  
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={pkg.image_url || 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg'}
                      alt={pkg.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{pkg.name}</h3>
                      <p className="text-sm opacity-90">{pkg.duration}</p>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-primary">
                            {formatCurrency(pkg.price)}
                          </span>
                          {pkg.original_price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(pkg.original_price)}
                            </span>
                          )}
                        </div>
                        {pkg.discount_percentage > 0 && (
                          <div className="text-xs text-green-600 font-medium">
                            Save {pkg.discount_percentage}%
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      <p className="text-sm font-medium text-gray-700">Includes:</p>
                      <div className="space-y-1">
                        {(pkg.includes || []).slice(0, 4).map((item: string, index: number) => (
                          <div key={index} className="flex items-center text-xs text-gray-600">
                            <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                            {item}
                          </div>
                        ))}
                        {(pkg.includes || []).length > 4 && (
                          <p className="text-xs text-gray-500">
                            +{(pkg.includes || []).length - 4} more services
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => startCustomization(pkg)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Customize
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-primary hover:bg-primary-600"
                        onClick={() => addToCart(pkg)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Create Custom Package */}
            <Card className="bg-gradient-to-r from-primary to-primary-600 text-white">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Create Your Custom Package</h3>
                <p className="text-lg opacity-90 mb-6">
                  Build your perfect wedding package by selecting individual vendors
                </p>
                <Link href="/vendors">
                  <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-gray-100">
                    <Plus className="w-5 h-5 mr-2" />
                    Start Building
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Customization Interface */
          <div className="space-y-8">
            {/* Customization Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-serif font-bold text-gray-900">
                  Customize {selectedPackage?.name}
                </h2>
                <p className="text-gray-600">
                  Swap vendors to create your perfect wedding package
                </p>
              </div>
              <div className="flex space-x-4">
                <Button 
                  variant="outline"
                  onClick={() => setCustomizing(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary-600"
                  onClick={() => addToCart(customPackage)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>

            {/* Price Summary */}
            <Card className="bg-primary-50 border-primary-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">Custom Package Price</h3>
                    <p className="text-sm text-primary-600">
                      {customPackage?.customPrice !== selectedPackage?.price && 
                        `Original: ${formatCurrency(selectedPackage?.price || 0)}`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(customPackage?.customPrice || 0)}
                    </div>
                    {customPackage?.customPrice !== selectedPackage?.price && (
                      <div className={`text-sm font-medium ${
                        (customPackage?.customPrice || 0) > (selectedPackage?.price || 0) ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {(customPackage?.customPrice || 0) > (selectedPackage?.price || 0) ? '+' : ''}
                        {formatCurrency((customPackage?.customPrice || 0) - (selectedPackage?.price || 0))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Customization */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Current Package Vendors */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Current Package</h3>
                <div className="space-y-4">
                  {(customPackage?.vendors || []).map((vendor, index) => {
                    const vendorData = vendors.find((v) => v.id.toString() === vendor.vendor_id?.toString());
                    return (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{vendor.vendor_name}</h4>
                              <p className="text-sm text-gray-600">{vendor.category}</p>
                              {vendorData && (
                                <div className="flex items-center mt-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                                  <span className="text-sm">{vendorData.rating || '4.5'}</span>
                                  <span className="text-sm text-gray-600 ml-2">
                                    {formatCurrency(vendorData.price_min || 0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Alternative Vendors */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Alternative Vendors</h3>
                
                {/* Search and Filter */}
                <div className="flex space-x-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search vendors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredVendors.map((vendor: any) => (
                    <Card key={vendor.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{vendor.name}</h4>
                            <p className="text-sm text-gray-600">{vendor.category}</p>
                            <div className="flex items-center mt-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                              <span className="text-sm">{vendor.rating || '4.5'}</span>
                              <span className="text-sm text-gray-600 ml-2">
                                {formatCurrency(vendor.price_min || 0)}
                              </span>
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => swapVendor(vendor.category, vendor.id.toString())}
                            className="bg-primary hover:bg-primary-600"
                          >
                            Swap
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}