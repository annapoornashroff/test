'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';

const trendingThemes = [
  {
    id: 1,
    name: 'Royal Rajasthani',
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg',
    popularity: 95,
    tags: ['Traditional', 'Luxury', 'Heritage']
  },
  {
    id: 2,
    name: 'Modern Minimalist',
    image: 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg',
    popularity: 88,
    tags: ['Contemporary', 'Elegant', 'Simple']
  },
  {
    id: 3,
    name: 'Garden Paradise',
    image: 'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg',
    popularity: 92,
    tags: ['Outdoor', 'Natural', 'Fresh']
  }
];

export default function TrendingSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gold via-gold-400 to-gold-500 relative overflow-hidden">
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
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8">
            CHECK WHAT&apos;S TRENDING!
          </h2>
        </div>

        {/* Trending Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {trendingThemes.map((theme) => (
            <Card key={theme.id} className="bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={theme.image}
                  alt={theme.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{theme.name}</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm">{theme.popularity}% trending</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 rounded-full px-3 py-1">
                    <span className="text-xs font-semibold text-gold">TRENDING</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  {theme.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-gold-50 text-gold-700 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-gold hover:bg-gold-600 text-white">
                  Explore Theme
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
            <Filter className="w-5 h-5 mr-2" />
            FILTER / SORT
          </Button>
          <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
            VIEW ALL
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}