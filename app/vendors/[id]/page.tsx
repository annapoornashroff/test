'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { 
  Heart, Star, MapPin, Calendar, Phone, Mail, 
  Globe, ShoppingCart, ChevronLeft, ChevronRight,
  Check, X, Clock, Loader2, User
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiClient, handleApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import Image from 'next/image';
import { type WeddingProject, type Vendor } from '@/lib/types/ui';
import { useCart } from '@/lib/hooks/useCart';

export default function VendorDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { handleCartAction, loading: cartLoading } = useCart();
  
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [weddings, setWeddings] = useState<WeddingProject[]>([]);
  const [selectedWedding, setSelectedWedding] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const loadVendorData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load vendor details
      const vendorData = await apiClient.getVendor(Number(id));
      setVendor(vendorData as Vendor);
      
      // If user is logged in, load their weddings
      if (user) {
        try {
          const token = await user.getIdToken();
          const weddingsData = await apiClient.getWeddings();
          const typedWeddingsData = weddingsData as WeddingProject[];
          setWeddings(typedWeddingsData);
          
          if (typedWeddingsData.length > 0) {
            setSelectedWedding(typedWeddingsData[0].id);
            setSelectedDate(new Date(typedWeddingsData[0].date).toISOString().split('T')[0]);
          }
        } catch (error) {
          console.error('Error loading weddings:', error);
          // Non-critical error, don't show to user
        }
      }
    } catch (error: any) {
      console.error('Error loading vendor:', error);
      setError(error.message || 'Failed to load vendor details');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadVendorData();
  }, [loadVendorData]);

  const addToWishlist = async () => {
    if (!user) {
      toast.error('Please log in to add to wishlist');
      return;
    }
    
    if (!selectedWedding) {
      toast.error('Please select a wedding project');
      return;
    }

    try {
      setActionLoading(true);
      const token = await user.getIdToken();
      
      await apiClient.addToCart({
        wedding_id: selectedWedding,
        vendor_id: vendor?.id,
        category: vendor?.category,
        price: vendor?.price_min || 0,
        booking_date: selectedDate || new Date().toISOString(),
        status: 'wishlisted'
      });
      
      toast.success('Added to wishlist');
    } catch (error: any) {
      handleApiError(error, 'Failed to add to wishlist');
    } finally {
      setActionLoading(false);
    }
  };

  const bookVisit = async () => {
    if (!user) {
      toast.error('Please log in to book a visit');
      return;
    }
    
    if (!selectedWedding) {
      toast.error('Please select a wedding project');
      return;
    }

    try {
      setActionLoading(true);
      const token = await user.getIdToken();
      
      await apiClient.addToCart({
        wedding_id: selectedWedding,
        vendor_id: vendor?.id,
        category: vendor?.category,
        price: vendor?.price_min || 0,
        booking_date: selectedDate || new Date().toISOString(),
        status: 'visited',
        visit_date: new Date().toISOString()
      });
      
      toast.success('Visit booked successfully');
    } catch (error: any) {
      handleApiError(error, 'Failed to book visit');
    } finally {
      setActionLoading(false);
    }
  };

  const addToCart = async () => {
    if (!selectedWedding || !vendor) {
      toast.error('Please select a wedding project');
      return;
    }

    await handleCartAction('ADD_TO_CART', {
      wedding_id: selectedWedding,
      vendor_id: vendor.id,
      category: vendor.category,
      price: vendor.price_min || 0,
      booking_date: selectedDate || new Date().toISOString(),
      status: 'selected'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const nextImage = () => {
    if (vendor && vendor.images && vendor.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % vendor.images.length);
    }
  };

  const prevImage = () => {
    if (vendor && vendor.images && vendor.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + vendor.images.length) % vendor.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <ErrorMessage message={error} className="mb-4" />
            <Button onClick={loadVendorData}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Vendor Not Found</h3>
            <p className="text-gray-600 mb-4">The vendor you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link href="/vendors">
              <Button>
                Back to Vendors
              </Button>
            </Link>
          </CardContent>
        </Card>
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
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/vendors" className="text-gray-600 hover:text-primary flex items-center">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Vendors
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vendor Images */}
            <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
              {vendor.images && vendor.images.length > 0 ? (
                <Image
                  src={vendor.images[currentImageIndex]}
                  alt={vendor.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              ) : (
                <Image
                  src="https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg"
                  alt={vendor.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              )}
              
              {vendor.images && vendor.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                  
                  {/* Image Pagination */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {vendor.images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              
              {vendor.is_featured && (
                <div className="absolute top-4 left-4 bg-gold text-white px-3 py-1 rounded-full text-xs font-medium">
                  Featured
                </div>
              )}
            </div>

            {/* Vendor Details */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">{vendor.name}</h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm bg-primary-50 text-primary px-3 py-1 rounded-full font-medium">
                      {vendor.category}
                    </span>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {vendor.location}
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                      <span className="font-medium">{vendor.rating}</span>
                      <span className="text-gray-600 ml-1">({vendor.review_count} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={addToWishlist}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Heart className="w-4 h-4 mr-2" />
                  )}
                  Add to Wishlist
                </Button>
              </div>
              
              <p className="text-gray-600 mb-6">
                {vendor.description || 'No description available.'}
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Price Range</h3>
                  <div className="text-2xl font-bold text-primary">
                    {vendor.price_min && vendor.price_max ? (
                      <>
                        {formatCurrency(vendor.price_min)} - {formatCurrency(vendor.price_max)}
                      </>
                    ) : vendor.price_min ? (
                      <>From {formatCurrency(vendor.price_min)}</>
                    ) : (
                      'Price on request'
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    {vendor.contact_phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        <a href={`tel:${vendor.contact_phone}`} className="hover:text-primary">
                          {vendor.contact_phone}
                        </a>
                      </div>
                    )}
                    {vendor.contact_email && (
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        <a href={`mailto:${vendor.contact_email}`} className="hover:text-primary">
                          {vendor.contact_email}
                        </a>
                      </div>
                    )}
                    {vendor.contact_website && (
                      <div className="flex items-center text-sm">
                        <Globe className="w-4 h-4 mr-2 text-gray-500" />
                        <a href={vendor.contact_website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                          {vendor.contact_website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Services */}
            {vendor.services && vendor.services.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Services Offered</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {vendor.services.map((service: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm">{service}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Portfolio */}
            {vendor.portfolio && vendor.portfolio.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Portfolio</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {vendor.portfolio.map((image: string, index: number) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden relative">
                      <Image 
                        src={image} 
                        alt={`${vendor.name} portfolio ${index + 1}`} 
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-6">
              <CardContent className="p-6 space-y-6">
                <h3 className="text-lg font-semibold">Book This Vendor</h3>
                
                {user ? (
                  <>
                    {weddings.length > 0 ? (
                      <>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Wedding Project
                            </label>
                            <select
                              value={selectedWedding || ''}
                              onChange={(e) => setSelectedWedding(Number(e.target.value))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              disabled={actionLoading}
                            >
                              {weddings.map((wedding: WeddingProject) => (
                                <option key={wedding.id} value={wedding.id}>
                                  {wedding.name} ({new Date(wedding.date).toLocaleDateString()})
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Booking Date
                            </label>
                            <input
                              type="date"
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              disabled={actionLoading}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <Button 
                            className="w-full bg-primary hover:bg-primary-600"
                            onClick={addToCart}
                            disabled={actionLoading}
                          >
                            {actionLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Add to Cart
                              </>
                            )}
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={bookVisit}
                            disabled={actionLoading}
                          >
                            {actionLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Calendar className="w-4 h-4 mr-2" />
                                Book Visit
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-4">You need to create a wedding project first</p>
                        <Link href="/planning">
                          <Button className="bg-primary hover:bg-primary-600">
                            Create Wedding Project
                          </Button>
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">Please log in to book this vendor</p>
                    <Link href="/login">
                      <Button className="bg-primary hover:bg-primary-600">
                        Log In
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Availability */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Availability Status</h3>
                <div className="flex items-center space-x-2">
                  {vendor.is_active ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">Available for Booking</span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-red-600 font-medium">Currently Unavailable</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Reviews Summary */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Reviews</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-3xl font-bold">{vendor.rating}</div>
                  <div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${i < Math.floor(vendor.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      Based on {vendor.review_count} reviews
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  Read All Reviews
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}