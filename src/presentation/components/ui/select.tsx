import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

const SelectContext = React.createContext<{
  value?: string;
  label?: string;
  onValueChange?: (value: string, label: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}>({
  isOpen: false,
  setIsOpen: () => {},
  containerRef: { current: null },
});

const Select = ({ value, defaultValue, onValueChange, children }: SelectProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || value);
  const [internalLabel, setInternalLabel] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleValueChange = (newValue: string, newLabel: string) => {
    setInternalValue(newValue);
    setInternalLabel(newLabel);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // Cerrar el dropdown al hacer click fuera (incluye el contenido renderizado en portal)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isInsideTrigger = target.closest('[data-select-container]');
      const isInsideContent = target.closest('[data-select-content]');
      if (!isInsideTrigger && !isInsideContent) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <SelectContext.Provider value={{ value: internalValue, label: internalLabel, onValueChange: handleValueChange, isOpen, setIsOpen, containerRef }}>
      <div className="relative" data-select-container ref={containerRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { value, isOpen, setIsOpen } = React.useContext(SelectContext);

  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        'flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
      {...props}
    >
      <span>{children || value || 'Selecciona...'}</span>
      <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform', isOpen && 'rotate-180')} />
    </button>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder, children }: { placeholder?: string; children?: React.ReactNode }) => {
  const { label, value } = React.useContext(SelectContext);
  return <span>{children ?? (label || value) ?? placeholder}</span>;
};

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { isOpen, containerRef } = React.useContext(SelectContext);
  const [position, setPosition] = React.useState<{
    top?: number;
    left: number;
    minWidth: number;
    bottom?: number;
    openUpwards: boolean;
  }>({ left: 0, minWidth: 0, openUpwards: false });

  React.useLayoutEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const minWidth = Math.max(rect.width, 128);
    const gap = 4;
    /** Altura máxima del panel (coherente con max-h en className) */
    const maxPanel = Math.min(320, window.innerHeight * 0.75);
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const openUpwards = spaceBelow < Math.min(maxPanel, 200) && spaceAbove > spaceBelow;

    if (openUpwards) {
      setPosition({
        openUpwards: true,
        left: rect.left,
        minWidth,
        bottom: window.innerHeight - rect.top + gap,
      });
    } else {
      setPosition({
        openUpwards: false,
        top: rect.bottom + gap,
        left: rect.left,
        minWidth,
      });
    }
  }, [isOpen, containerRef]);

  if (!isOpen) return null;

  const content = (
    <div
      ref={ref}
      data-select-content
      className={cn(
        'z-[9999] max-h-[min(20rem,75vh)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800',
        className
      )}
      style={{
        position: 'fixed',
        left: position.left,
        minWidth: position.minWidth,
        ...(position.openUpwards
          ? { bottom: position.bottom, top: 'auto' as const }
          : { top: position.top, bottom: 'auto' as const }),
      }}
      {...props}
    >
      <div className="p-1">
        {children}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
});
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const { onValueChange, value: selectedValue } = React.useContext(SelectContext);
  const itemRef = React.useRef<HTMLDivElement>(null);

  const isSelected = selectedValue === value;

  return (
    <div
      ref={(node) => {
        (itemRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700',
        isSelected && 'bg-slate-100 dark:bg-slate-700',
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        const label = itemRef.current?.textContent ?? '';
        onValueChange?.(value, label);
      }}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
