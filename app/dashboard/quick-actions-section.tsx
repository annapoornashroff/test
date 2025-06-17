import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Bookmark, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

const quickActions = [
  { icon: ShoppingCart, label: 'Browse Vendors', href: '/vendors', color: 'bg-blue-500' },
  { icon: Bookmark, label: 'My Wishlist', href: '/wishlist', color: 'bg-purple-500' },
  { icon: Calendar, label: 'Book Visits', href: '/vendors', color: 'bg-green-500' },
  { icon: Users, label: 'Guest List', href: '/guests', color: 'bg-orange-500' }
];

export default function QuickActionsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link href={action.href} key={index}>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg text-center transition-all hover:bg-gray-100 h-full">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${action.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">{action.label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 