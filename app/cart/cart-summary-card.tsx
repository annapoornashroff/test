import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CartSummaryCardProps {
  cartSummary: {
    total_items: number;
    total_amount: number;
    status_breakdown: Record<string, number>;
  } | null;
  formatCurrency: (amount: number) => string;
}

export default function CartSummaryCard({ cartSummary, formatCurrency }: CartSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cart Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cartSummary ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Items</span>
              <span className="font-semibold text-lg">{cartSummary.total_items}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Estimated Total Cost</span>
              <span className="font-semibold text-lg text-primary">
                {formatCurrency(cartSummary.total_amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Booked Vendors</span>
              <span className="font-semibold text-lg">{cartSummary.status_breakdown.booked || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Wishlisted Vendors</span>
              <span className="font-semibold text-lg">{cartSummary.status_breakdown.wishlisted || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Visited Vendors</span>
              <span className="font-semibold text-lg">{cartSummary.status_breakdown.visited || 0}</span>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No summary available.</p>
        )}
      </CardContent>
    </Card>
  );
} 