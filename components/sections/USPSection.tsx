'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Calendar, Shield, Star } from 'lucide-react';

const features = [
  {
    icon: ShoppingCart,
    title: 'E-Commerce Experience',
    description: 'Complete online shopping experience with unified checkout system for all wedding services.',
    color: 'bg-blue-500'
  },
  {
    icon: Calendar,
    title: 'Complete Wedding Tracking',
    description: 'Track every detail of your wedding planning journey with minute-by-minute scheduling.',
    color: 'bg-green-500'
  },
  {
    icon: Shield,
    title: 'Stress-Free Planning',
    description: 'Enjoy your special day without any last-minute planning stress or anxiety.',
    color: 'bg-purple-500'
  }
];

export default function USPSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            WHAT MAKES US SPECIAL?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We revolutionize wedding planning with our unique approach that combines technology, 
            personalization, and comprehensive service management.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-pink-50 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">500+</div>
            <div className="text-sm text-gray-600">Happy Couples</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">1000+</div>
            <div className="text-sm text-gray-600">Trusted Vendors</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">50+</div>
            <div className="text-sm text-gray-600">Cities Covered</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">4.9</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}