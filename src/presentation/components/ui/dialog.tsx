import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from './button';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

const useDialogContext = () => {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within Dialog');
  }
  return context;
};

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  // Cerrar al presionar Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70"
          onClick={() => onOpenChange(false)}
        />
        {/* Dialog Content */}
        <div className="relative z-50 max-h-[90vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
};

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  useDialogContext();

  return (
    <div
      ref={ref}
      className={cn(
        'bg-white dark:bg-gray-900/50 rounded-xl shadow-lg p-6 md:p-8',
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  );
});
DialogContent.displayName = 'DialogContent';

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 mb-6', className)}
      {...props}
    />
  );
});
DialogHeader.displayName = 'DialogHeader';

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h2
      ref={ref}
      className={cn(
        'text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white',
        className
      )}
      {...props}
    />
  );
});
DialogTitle.displayName = 'DialogTitle';

const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { onOpenChange } = useDialogContext();

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        'absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100',
        className
      )}
      onClick={() => onOpenChange(false)}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Cerrar</span>
    </Button>
  );
});
DialogClose.displayName = 'DialogClose';

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 mt-6', className)}
      {...props}
    />
  );
});
DialogFooter.displayName = 'DialogFooter';

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter };

