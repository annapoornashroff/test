'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigation } from '@/lib/navigation-context';
import { Loading } from '@/components/ui/loading';
import { useState } from 'react';

export default function DreamBoardSectionClient() {
  const { navigate } = useNavigation();
  const [isCreating, setIsCreating] = useState(false);
  const [isBrowsing, setIsBrowsing] = useState(false);

  const handleStartCreating = async () => {
    setIsCreating(true);
    try {
      await navigate('/dream-board/create');
    } finally {
      setIsCreating(false);
    }
  };

  const handleBrowseGallery = async () => {
    setIsBrowsing(true);
    try {
      await navigate('/dream-board/gallery');
    } finally {
      setIsBrowsing(false);
    }
  };

  const handleUploadArea = async () => {
    await navigate('/dream-board/upload');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary-600 to-primary-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 indian-pattern opacity-20" />
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-24 h-24 border-4 border-white/20 rounded-full" />
      <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-white/20 rounded-full" />
      <div className="absolute top-1/2 left-20 w-16 h-16 border-4 border-white/20 rounded-full" />
      <div className="absolute top-1/4 right-20 w-20 h-20 border-4 border-white/20 rounded-full" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Upload Area */}
          <div 
            className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-3xl p-16 mb-8 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
            onClick={handleUploadArea}
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-12 h-12 text-white" />
              </div>
              <div className="text-white text-center">
                <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                  ADD IMAGES<br />
                  TO CREATE<br />
                  YOUR DREAM<br />
                  BOARD
                </h3>
                <p className="text-lg opacity-90">
                  Upload inspiration photos to visualize your perfect wedding
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 rounded-full"
              onClick={handleBrowseGallery}
              disabled={isBrowsing}
            >
              {isBrowsing ? (
                <Loading size="sm" className="text-white" />
              ) : (
                'Browse Gallery'
              )}
            </Button>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 rounded-full"
              onClick={handleStartCreating}
              disabled={isCreating}
            >
              {isCreating ? (
                <Loading size="sm" className="text-primary" />
              ) : (
                'Start Creating'
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
} 