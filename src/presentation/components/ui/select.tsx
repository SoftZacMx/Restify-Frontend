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
  /** value -> texto visible, calculado de los SelectItem (ver extractItemLabels) */
  itemLabels: Record<string, string>;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}>({
  itemLabels: {},
  isOpen: false,
  setIsOpen: () => {},
  containerRef: { current: null },
});

/** Texto plano de un nodo (ignora íconos/elementos sin texto). */
const extractText = (node: React.ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement(node)) {
    return extractText((node.props as { children?: React.ReactNode }).children);
  }
  return '';
};

/**
 * Recorre el árbol de children del Select (incluye SelectContent y mapeos
 * condicionales como `tables.map(...)`) y arma value -> etiqueta. Esto evita
 * depender del click del usuario: la etiqueta de un valor por defecto (ej.
 * "all" -> "Todo") queda disponible desde el primer render.
 */
const extractItemLabels = (node: React.ReactNode, map: Record<string, string>): void => {
  if (node === null || node === undefined || typeof node === 'boolean') return;
  if (Array.isArray(node)) {
    node.forEach((child) => extractItemLabels(child, map));
    return;
  }
  if (!React.isValidElement(node)) return;

  const props = node.props as { value?: string; children?: React.ReactNode };
  if (node.type === SelectItem && props.value !== undefined) {
    map[props.value] = extractText(props.children);
  }
  if (props.children) {
    extractItemLabels(props.children, map);
  }
};

const Select = ({ value, defaultValue, onValueChange, children }: SelectProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || value);
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const itemLabels = React.useMemo(() => {
    const map: Record<string, string> = {};
    extractItemLabels(children, map);
    return map;
  }, [children]);

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
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
    <SelectContext.Provider value={{ value: internalValue, itemLabels, onValueChange: handleValueChange, isOpen, setIsOpen, containerRef }}>
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
  const { value, itemLabels, isOpen, setIsOpen } = React.useContext(SelectContext);
  const displayValue = value !== undefined ? (itemLabels[value] ?? value) : undefined;

  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        'flex h-11 w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-base text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
      {...props}
    >
      <span className="truncate whitespace-nowrap">{children || displayValue || 'Selecciona...'}</span>
      <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform shrink-0', isOpen && 'rotate-180')} />
    </button>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder, children }: { placeholder?: string; children?: React.ReactNode }) => {
  const { value, itemLabels } = React.useContext(SelectContext);
  const displayValue = value !== undefined ? (itemLabels[value] ?? value) : undefined;
  return <span>{children ?? displayValue ?? placeholder}</span>;
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
        'z-[9999] max-h-[min(20rem,75vh)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-card shadow-lg dark:border-border dark:bg-card',
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

  const isSelected = selectedValue === value;

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none text-foreground hover:bg-muted dark:hover:bg-card focus:bg-muted dark:focus:bg-card',
        isSelected && 'bg-muted',
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onValueChange?.(value);
      }}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
