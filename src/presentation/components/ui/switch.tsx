import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
    };

    return (
      <label className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            onChange={handleChange}
            {...props}
          />
          <div
            className={cn(
              'block bg-gray-200 dark:bg-gray-700 w-11 h-6 rounded-full peer-checked:bg-primary transition',
              className
            )}
          />
          <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform peer-checked:translate-x-full" />
        </div>
      </label>
    );
  }
);
Switch.displayName = 'Switch';

export { Switch };

