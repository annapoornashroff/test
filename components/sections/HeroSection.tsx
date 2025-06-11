'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Heart, ShoppingCart, MapPin, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useNavigation } from '@/lib/navigation-context';
import { Loading } from '@/components/ui/loading';
import { useCity } from '@/lib/city-context';

const navigationItems = [
  {
    title: 'WEDDING',
    items: ['Venues', 'Catering', 'Decorators', 'Photography']
  },
  {
    title: 'PRE-WEDDING',
    items: ['Engagement', 'Mehendi', 'Sangeet', 'Haldi']
  },
  {
    title: 'PHOTOSHOOT',
    items: ['Pre-Wedding', 'Maternity', 'Baby Shower', 'Anniversary']
  },
  {
    title: 'HONEYMOON',
    items: ['Domestic', 'International', 'Adventure', 'Luxury']
  }
];

const weddingImages = [
  'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg',
  'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg',
  'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg',
  'https://images.pexels.com/photos/1024994/pexels-photo-1024994.jpeg',
  'https://images.pexels.com/photos/1444443/pexels-photo-1444443.jpeg'
];

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Jaipur', 'Goa'];

export default function HeroSection() {
  const { navigate } = useNavigation();
  const { selectedCity, setSelectedCity } = useCity();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % weddingImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check city dropdown
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(target)) {
        setShowCityDropdown(false);
      }
      
      // Check navigation dropdowns
      let clickedInsideAnyDropdown = false;
      Object.values(dropdownRefs.current).forEach(ref => {
        if (ref && ref.contains(target)) {
          clickedInsideAnyDropdown = true;
        }
      });
      
      if (!clickedInsideAnyDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdownToggle = (title: string) => {
    setActiveDropdown(activeDropdown === title ? null : title);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setShowCityDropdown(false);
  };

  const handleNavItemClick = async (category: string) => {
    setActiveDropdown(null);
    await navigate(`/vendors?category=${category.toLowerCase()}`);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      await navigate(`/vendors?search=${encodeURIComponent(searchQuery.trim())}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src={weddingImages[currentImageIndex]}
          alt="Wedding celebration"
          fill
          priority
          className="object-cover transition-opacity duration-1000"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Header */}
      <header className="relative z-10">
        {/* Top Bar */}
        <div className="bg-white/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-3"
            >
              <div className="w-auto h-12 overflow-hidden relative">
                <Image
                  src="/logo.png"
                  alt="Forever & Co. Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              </div>
            </button>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                className="rounded-lg bg-gold hover:bg-gold-600 text-white w-12 h-12 p-0"
                onClick={() => navigate('/wishlist')}
              >
                <Heart className="w-5 h-5" />
              </Button>
              <Button 
                size="sm" 
                className="rounded-lg bg-gold hover:bg-gold-600 text-white w-12 h-12 p-0"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="w-5 h-5" />
              </Button>
              <div className="relative" ref={cityDropdownRef}>
                <Button 
                  size="sm" 
                  className="rounded-lg bg-gold hover:bg-gold-600 text-white px-4 h-12 font-bold text-sm"
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                >
                  {selectedCity}
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                    showCityDropdown ? 'rotate-180' : ''
                  }`} />
                </Button>
                
                {/* City Dropdown */}
                {showCityDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                    <div className="py-2">
                      {cities.map((city) => (
                        <button
                          key={city}
                          onClick={() => handleCitySelect(city)}
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gold-50 hover:text-gold-700 transition-colors duration-150"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t border-gray-200">
            <div className="flex items-center justify-center space-x-16 py-4">
              {navigationItems.map((item) => (
                <div 
                  key={item.title} 
                  className="relative"
                  ref={el => dropdownRefs.current[item.title] = el}
                >
                  <button 
                    className="text-primary font-bold text-sm hover:text-primary-600 transition-colors flex items-center uppercase tracking-wide"
                    onClick={() => handleDropdownToggle(item.title)}
                  >
                    {item.title}
                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                      activeDropdown === item.title ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {/* Dropdown */}
                  {activeDropdown === item.title && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-40">
                      <div className="py-2">
                        {item.items.map((subItem) => (
                          <button
                            key={subItem}
                            onClick={() => handleNavItemClick(subItem)}
                            className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gold-50 hover:text-gold-700 transition-colors duration-150"
                          >
                            {subItem}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
        <div className="text-center max-w-4xl w-full">
          {/* Main Content Area */}
          <div className="mb-16">
            {/* Any additional content can go here */}
          </div>

          {/* Search Bar - Positioned at bottom */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="SEARCH"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full h-16 text-xl text-center border-0 rounded-2xl bg-white/95 backdrop-blur-sm placeholder:text-primary placeholder:font-bold placeholder:tracking-wider text-primary font-semibold shadow-2xl pr-20"
              />
              <Button
                size="lg"
                className="absolute right-2 top-2 h-12 w-12 rounded-xl bg-primary hover:bg-primary-600 transition-all duration-200"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loading size="sm" className="text-white" />
                ) : (
                  <Search className="w-6 h-6 text-white" />
                )}
              </Button>
            </div>
          </div>

          {/* Image Counter and Pagination */}
          <div className="text-white">
            <p className="text-lg font-bold tracking-wider mb-4">
              WEDDING IMAGES ({currentImageIndex + 1}/{weddingImages.length})
            </p>
            
            {/* Pagination Dots */}
            <div className="flex justify-center space-x-3">
              {weddingImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentImageIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Wedding CTA - Small Static Button */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <Link href="/planning">
          <Button 
            size="lg" 
            className="rounded-full shadow-lg bg-gold hover:bg-gold-600 text-white font-semibold px-6 py-3 transition-all duration-300 hover:scale-105"
          >
            Plan My Wedding
          </Button>
        </Link>
      </div>
    </section>
  );
}