import * as React from 'react';
import { cn } from '@/shared/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90',
      outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    };

    const sizeClasses = {
      default: 'h-11 px-4 text-base',
      sm: 'h-9 px-3 text-sm',
      lg: 'h-12 px-6 text-lg',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };

