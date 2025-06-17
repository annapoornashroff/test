import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function QuickLinksCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Links</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Link href="/vendors">
          <Button variant="outline" className="w-full">
            Browse Vendors
          </Button>
        </Link>
        <Link href="/wishlist">
          <Button variant="outline" className="w-full">
            My Wishlist
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="w-full">
            Dashboard
          </Button>
        </Link>
        <Link href="/planning">
          <Button variant="outline" className="w-full">
            Wedding Planning
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
} 