'use client';

import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

const steps = [
  {
    title: 'CHOOSE A PACKAGE',
    description: 'Select from our curated wedding packages or start with a custom plan'
  },
  {
    title: 'CHOOSE A VENDOR',
    description: 'Browse and select from our verified network of premium wedding vendors'
  },
  {
    title: 'ADD TO CART',
    description: 'Build your perfect wedding by adding services to your cart'
  },
  {
    title: 'CUSTOMISE',
    description: 'Personalize every detail to match your dream wedding vision'
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gold-50 to-gold-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 indian-pattern opacity-10" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            WONDERING HOW IT WORKS?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our simple 4-step process makes wedding planning effortless and enjoyable
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center mb-12 last:mb-0">
              {/* Step Button */}
              <Button 
                size="xl" 
                variant="gold" 
                className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mb-6"
              >
                {step.title}
              </Button>

              {/* Description */}
              <p className="text-gray-600 max-w-md mb-8">
                {step.description}
              </p>

              {/* Arrow (except for last step) */}
              {index < steps.length - 1 && (
                <ArrowDown className="w-8 h-8 text-primary animate-bounce" />
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button size="xl" variant="primary" className="rounded-full shadow-lg">
            Start Your Journey
          </Button>
        </div>
      </div>
    </section>
  );
}