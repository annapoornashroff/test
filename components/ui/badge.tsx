import * as React from 'react';
import { type BadgeProps } from '@/lib/types/ui';
import { badgeVariants } from '@/lib/styles/badge';
import { cn } from '@/lib/utils';

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
