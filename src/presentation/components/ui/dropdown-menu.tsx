import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/utils';

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined);

const useDropdownMenuContext = () => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenu components must be used within DropdownMenu');
  }
  return context;
};

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Cerrar al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown-menu]') && !target.closest('[data-dropdown-content]')) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open]);

  // Cerrar al presionar Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative" data-dropdown-menu>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ className, children, asChild, ...props }, ref) => {
  const { open, setOpen, triggerRef } = useDropdownMenuContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpen(!open);
    props.onClick?.(e);
  };

  // Combinar refs
  const combinedRef = (node: HTMLButtonElement) => {
    (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: combinedRef,
      onClick: handleClick,
      ...props,
    });
  }

  return (
    <button
      ref={combinedRef}
      type="button"
      className={cn(className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end' | 'center';
}

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ className, align = 'end', children, ...props }, ref) => {
  const { open, triggerRef } = useDropdownMenuContext();
  const [position, setPosition] = React.useState({ top: 0, left: 0, right: 0 });

  React.useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();

      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        right: window.innerWidth - rect.right,
      });
    }
  }, [open, triggerRef]);

  if (!open) return null;

  const getAlignStyles = (): React.CSSProperties => {
    switch (align) {
      case 'start':
        return { left: position.left };
      case 'center':
        return { left: position.left, transform: 'translateX(-50%)' };
      case 'end':
      default:
        return { right: position.right };
    }
  };

  return createPortal(
    <div
      ref={ref}
      data-dropdown-content
      className={cn(
        'fixed z-[9999] min-w-[8rem] overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg',
        className
      )}
      style={{
        top: position.top,
        ...getAlignStyles(),
      }}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>,
    document.body
  );
});
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    onSelect?: () => void;
  }
>(({ className, children, onSelect, ...props }, ref) => {
  const { setOpen } = useDropdownMenuContext();

  const handleClick = () => {
    onSelect?.();
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
});
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        '-mx-1 my-1 h-px bg-slate-200 dark:bg-slate-700',
        className
      )}
      {...props}
    />
  );
});
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator };

