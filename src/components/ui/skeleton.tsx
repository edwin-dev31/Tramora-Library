import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
}

const Skeleton = ({ className, variant = 'text', ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        {
          'h-4 w-full': variant === 'text',
          'h-10 w-10 rounded-full': variant === 'circular',
          'h-16 w-16 rounded-lg': variant === 'rectangular',
        },
        className
      )}
      {...props}
    />
  );
};

export { Skeleton };