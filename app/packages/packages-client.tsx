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
import { apiClient } from '@/lib/api-client';
import { type Vendor, type Package } from '@/lib/types/ui';
import PackagesHeader from '@/app/components/packages/packages-header';

export default function PackagesClient() {
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
      <PackagesHeader />

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
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {packages.length === 0 && !loading && !error && (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No packages available</h3>
                <p className="text-gray-600 mb-6">Check back later for exciting wedding packages!</p>
                <Link href="/vendors">
                  <Button className="bg-primary hover:bg-primary-600">
                    Browse Individual Vendors
                  </Button>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center space-x-4 mb-8">
              <Button variant="ghost" onClick={() => setCustomizing(false)}>
                <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                Back to Packages
              </Button>
              <h2 className="text-3xl font-serif font-bold text-gray-900">Customize Your Package</h2>
            </div>

            {selectedPackage && customPackage && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{customPackage.name}</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(customPackage.customPrice || customPackage.price)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {customPackage.vendors?.map((vendor: any) => (
                    <div key={vendor.category} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <h4 className="font-semibold text-lg mb-2">{vendor.category}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">{vendor.vendor_name}</span>
                        <select
                          value={vendor.vendor_id}
                          onChange={(e) => swapVendor(vendor.category, e.target.value)}
                          className="p-2 border rounded-md"
                        >
                          {vendors.filter(v => v.category === vendor.category).map(v => (
                            <option key={v.id} value={v.id.toString()}>
                              {v.name} ({formatCurrency(v.price_min)})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    className="w-full bg-primary hover:bg-primary-600"
                    onClick={() => addToCart(customPackage)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add Customized Package to Cart
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 