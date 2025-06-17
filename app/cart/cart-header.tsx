import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CartHeader() {
  return (
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
              <Button variant="outline" size="sm" className="rounded-full">
                Browse Vendors
              </Button>
            </Link>
            <Link href="/wishlist">
              <Button variant="gold" size="sm" className="rounded-full">
                <Heart className="w-4 h-4 mr-2" />
                Wishlist
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 