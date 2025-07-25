import { cn } from "@/lib/utils";
import { type LoadingProps } from '@/lib/types/ui';

export function Loading({ size = 'md', className }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-gray-200",
          sizeClasses[size]
        )}
        style={{
          borderTopColor: "var(--gold)",
        }}
      />
    </div>
  );
} 