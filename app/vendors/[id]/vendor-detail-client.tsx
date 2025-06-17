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
import { Input } from '@/components/ui/input';
import { type WeddingProject, type Vendor } from '@/lib/types/ui';
import { useCart } from '@/lib/hooks/useCart';

export default function VendorDetailClient() {
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

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <div className="mb-6">
            <Link href="/vendors" className="flex items-center text-primary hover:text-primary-600 transition-colors">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Vendors
            </Link>
          </div>

          {/* Vendor Details */}          
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden md:flex">
            {/* Image Carousel */}
            <div className="md:w-1/2 relative">
              {vendor.images && vendor.images.length > 0 && (
                <Image
                  src={vendor.images[currentImageIndex]}
                  alt={vendor.name}
                  width={600}
                  height={400}
                  className="w-full h-96 object-cover"
                />
              )}
              {vendor.images && vendor.images.length > 1 && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white text-gray-800"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white text-gray-800"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Vendor Info */}
            <div className="md:w-1/2 p-8">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">{vendor.name}</h2>
              <p className="text-lg text-gold font-medium mb-3">{vendor.category}</p>

              <div className="flex items-center text-gray-600 mb-4">
                <Star className="w-5 h-5 mr-1 text-yellow-500 fill-yellow-500" />
                <span className="text-md font-semibold">{vendor.rating || 'N/A'}</span>
                <span className="ml-2">({vendor.review_count} reviews)</span>
                <span className="mx-3 text-gray-400">|</span>
                <MapPin className="w-5 h-5 mr-1" />
                <span>{vendor.city}</span>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                {vendor.description}
              </p>

              <div className="space-y-3 mb-6">
                {vendor.contact_phone && (
                  <p className="flex items-center text-gray-700">
                    <Phone className="w-5 h-5 mr-3 text-primary" />
                    {vendor.contact_phone}
                  </p>
                )}
                {vendor.contact_email && (
                  <p className="flex items-center text-gray-700">
                    <Mail className="w-5 h-5 mr-3 text-primary" />
                    {vendor.contact_email}
                  </p>
                )}
                {vendor.contact_website && (
                  <p className="flex items-center text-gray-700">
                    <Globe className="w-5 h-5 mr-3 text-primary" />
                    <Link href={vendor.contact_website} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                      Visit Website
                    </Link>
                  </p>
                )}
              </div>

              <div className="text-2xl font-bold text-primary mb-6">
                {vendor.price_min && vendor.price_max ? (
                  `₹${formatCurrency(vendor.price_min)} - ₹${formatCurrency(vendor.price_max)}`
                ) : vendor.price_min ? (
                  `Starting from ₹${formatCurrency(vendor.price_min)}`
                ) : (
                  'Price on request'
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-12 flex items-center"
                  onClick={addToWishlist}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Heart className="w-5 h-5 mr-2" />
                  )}
                  Add to Wishlist
                </Button>
                <Button 
                  size="lg" 
                  className="h-12 bg-gold hover:bg-gold-600 flex items-center"
                  onClick={addToCart}
                  disabled={cartLoading}
                >
                  {cartLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5 mr-2" />
                  )}
                  Add to Cart
                </Button>
              </div>

              {/* Booking/Visit Section */}
              {user && ( // Only show if user is logged in
                <Card className="bg-gray-50 p-6 rounded-2xl shadow-inner">
                  <CardContent className="p-0 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Book a Visit / Add to Project</h3>
                    <div>
                      <label htmlFor="weddingProject" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Wedding Project
                      </label>
                      <select
                        id="weddingProject"
                        value={selectedWedding || ''}
                        onChange={(e) => setSelectedWedding(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                        disabled={weddings.length === 0}
                      >
                        {weddings.length === 0 ? (
                          <option value="">No wedding projects found. Please create one.</option>
                        ) : (
                          weddings.map(project => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Visit Date
                      </label>
                      <Input
                        type="date"
                        id="visitDate"
                        value={selectedDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                      />
                    </div>
                    <Button 
                      onClick={bookVisit}
                      disabled={!selectedWedding || actionLoading}
                      className="w-full bg-primary hover:bg-primary-600"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Calendar className="w-5 h-5 mr-2" />
                      )}
                      Book Visit
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          {/* The 'reviews' property does not exist on the 'Vendor' type based on the current data model.
              Therefore, this section will not display any reviews. */}
          {vendor.review_count > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">Customer Reviews ({vendor.review_count})</h3>
              <div className="space-y-8">
                {/* As 'reviews' is not on Vendor type, we cannot map over it directly.
                    This section would require a separate API call or a change to the Vendor type. */}
                <p className="text-gray-600 text-center">No reviews available or loaded for this vendor.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer (if any) */}
    </div>
  );
} 