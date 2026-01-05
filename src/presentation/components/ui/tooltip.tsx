import React, { useState } from 'react';
import { cn } from '@/shared/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Componente Tooltip simple
 * Muestra un tooltip al hacer hover sobre el elemento hijo
 */
export const Tooltip: React.FC<TooltipProps> = ({ children, content, side = 'right' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-2 py-1 text-xs font-medium text-white bg-slate-900 dark:bg-slate-700 rounded shadow-lg whitespace-nowrap',
            sideClasses[side]
          )}
        >
          {content}
          {/* Arrow */}
          <div
            className={cn(
              'absolute w-0 h-0 border-4 border-transparent',
              side === 'right' && 'right-full top-1/2 -translate-y-1/2 border-r-slate-900 dark:border-r-slate-700',
              side === 'left' && 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 dark:border-l-slate-700',
              side === 'top' && 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 dark:border-t-slate-700',
              side === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 dark:border-b-slate-700'
            )}
          />
        </div>
      )}
    </div>
  );
};

