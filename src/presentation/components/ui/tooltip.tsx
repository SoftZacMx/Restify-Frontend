import React, { useRef, useState } from 'react';
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
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const computeStyle = (): React.CSSProperties => {
    const el = triggerRef.current;
    if (!el) return {};
    const rect = el.getBoundingClientRect();
    const gap = 8;
    switch (side) {
      case 'right':
        return { top: rect.top + rect.height / 2, left: rect.right + gap, transform: 'translateY(-50%)' };
      case 'left':
        return { top: rect.top + rect.height / 2, left: rect.left - gap, transform: 'translate(-100%, -50%)' };
      case 'top':
        return { top: rect.top - gap, left: rect.left + rect.width / 2, transform: 'translate(-50%, -100%)' };
      case 'bottom':
        return { top: rect.bottom + gap, left: rect.left + rect.width / 2, transform: 'translate(-50%, 0)' };
    }
  };

  const handleMouseEnter = () => {
    setStyle(computeStyle());
    setIsVisible(true);
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className="fixed z-[100] px-2 py-1 text-xs font-medium text-white bg-slate-900 dark:bg-slate-700 rounded shadow-lg whitespace-nowrap pointer-events-none"
          style={style}
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
