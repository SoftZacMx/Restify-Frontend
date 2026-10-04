import React, { useRef, useState, useLayoutEffect } from 'react';
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
  const tooltipRef = useRef<HTMLDivElement>(null);
  /** Estilo base (sin ajuste de viewport); se conserva para no re-acumular ajustes. */
  const baseStyleRef = useRef<React.CSSProperties>({});
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
    const base = computeStyle();
    baseStyleRef.current = base;
    setStyle(base);
    setIsVisible(true);
  };

  // Ajuste post-render, una sola vez por apertura: si el tooltip se sale de la
  // pantalla (típico al centrarlo sobre un botón pegado al borde izquierdo),
  // lo recorremos hacia adentro. No depende de `style` para evitar re-render en bucle.
  useLayoutEffect(() => {
    if (!isVisible) return;
    const tip = tooltipRef.current;
    if (!tip) return;
    const tipRect = tip.getBoundingClientRect();
    // Sin medidas reales (entornos de test / viewport 0) no hay nada que ajustar.
    if (tipRect.width === 0 || window.innerWidth === 0) return;
    const margin = 8;
    let adjust = 0;
    if (tipRect.left < margin) adjust = margin - tipRect.left;
    else if (tipRect.right > window.innerWidth - margin) {
      adjust = window.innerWidth - margin - tipRect.right;
    }
    if (adjust !== 0) {
      const base = baseStyleRef.current;
      setStyle({ ...base, left: (typeof base.left === 'number' ? base.left : 0) + adjust });
    }
  }, [isVisible]);

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
          ref={tooltipRef}
          role="tooltip"
          className="fixed z-[100] px-2 py-1 text-xs font-medium text-white bg-foreground dark:bg-card rounded shadow-lg whitespace-nowrap pointer-events-none"
          style={style}
        >
          {content}
          {/* Arrow */}
          <div
            className={cn(
              'absolute w-0 h-0 border-4 border-transparent',
              side === 'right' && 'right-full top-1/2 -translate-y-1/2 border-r-foreground dark:border-r-card',
              side === 'left' && 'left-full top-1/2 -translate-y-1/2 border-l-foreground dark:border-l-card',
              side === 'top' && 'top-full left-1/2 -translate-x-1/2 border-t-foreground dark:border-t-card',
              side === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 border-b-foreground dark:border-b-card'
            )}
          />
        </div>
      )}
    </div>
  );
};
