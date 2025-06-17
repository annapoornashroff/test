import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';
import { type CartItem } from '@/lib/types/ui';

interface PlanningProgressCardProps {
  completionPercentage: number;
  categoryProgress: { name: string; completed: boolean; status: string }[];
  getStatusIcon: (status: string) => React.ElementType;
  getStatusColor: (status: string) => string;
}

export default function PlanningProgressCard({
  completionPercentage,
  categoryProgress,
  getStatusIcon,
  getStatusColor,
}: PlanningProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Planning Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center mb-4">
          <div className="relative w-24 h-24 mx-auto">
            <PieChart className="w-full h-full text-primary-200" strokeWidth={1} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">Categories Covered</p>
        </div>
        <div className="space-y-2">
          {categoryProgress.map((cat, index) => {
            const StatusIcon = getStatusIcon(cat.status);
            const colorClass = getStatusColor(cat.status);
            return (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{cat.name}</span>
                {cat.completed ? (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${colorClass}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {cat.status.charAt(0).toUpperCase() + cat.status.slice(1)}
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-500 bg-gray-100">
                    Pending
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 