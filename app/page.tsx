import HeroSection from '@/components/sections/HeroSection';
import PackageSection from '@/components/sections/PackageSection';
import VendorSection from '@/components/sections/VendorSection';
import DreamBoardSection from '@/components/sections/DreamBoardSection';
import USPSection from '@/components/sections/USPSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import TrendingSection from '@/components/sections/TrendingSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import FooterSection from '@/components/sections/FooterSection';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <PackageSection />
      <VendorSection />
      <DreamBoardSection />
      <USPSection />
      <HowItWorksSection />
      <TrendingSection />
      <TestimonialsSection />
      <FooterSection />
    </main>
  );
}