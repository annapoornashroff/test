import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ErrorMessageProps } from '@/lib/types/ui';

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  return (
    <div className={cn('flex items-center space-x-2 text-red-600 text-sm', className)}>
      <AlertCircle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
}