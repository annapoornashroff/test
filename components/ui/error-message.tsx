import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  return (
    <div className={cn('flex items-center space-x-2 text-red-600 text-sm', className)}>
      <AlertCircle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
}