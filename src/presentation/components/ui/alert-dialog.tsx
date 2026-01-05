import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Button } from './button';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface AlertDialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | undefined>(undefined);

const useAlertDialogContext = () => {
  const context = React.useContext(AlertDialogContext);
  if (!context) {
    throw new Error('AlertDialog components must be used within AlertDialog');
  }
  return context;
};

const AlertDialog = ({ open, onOpenChange, children }: AlertDialogProps) => {
  // Cerrar al presionar Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70"
          onClick={() => onOpenChange(false)}
        />
        {/* Dialog Content */}
        <div className="relative z-50 w-full max-w-md mx-4">
          {children}
        </div>
      </div>
    </AlertDialogContext.Provider>
  );
};

const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6',
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  );
});
AlertDialogContent.displayName = 'AlertDialogContent';

const AlertDialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-2 mb-4', className)}
      {...props}
    />
  );
});
AlertDialogHeader.displayName = 'AlertDialogHeader';

const AlertDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold text-slate-900 dark:text-white', className)}
      {...props}
    />
  );
});
AlertDialogTitle.displayName = 'AlertDialogTitle';

const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
      {...props}
    />
  );
});
AlertDialogDescription.displayName = 'AlertDialogDescription';

const AlertDialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex justify-end gap-3 mt-6', className)}
      {...props}
    />
  );
});
AlertDialogFooter.displayName = 'AlertDialogFooter';

const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { onOpenChange } = useAlertDialogContext();

  return (
    <Button
      ref={ref}
      type="button"
      variant="outline"
      onClick={() => onOpenChange(false)}
      className={className}
      {...props}
    />
  );
});
AlertDialogCancel.displayName = 'AlertDialogCancel';

const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { onOpenChange } = useAlertDialogContext();

  return (
    <Button
      ref={ref}
      type="button"
      onClick={(e) => {
        props.onClick?.(e);
        onOpenChange(false);
      }}
      className={className}
      {...props}
    />
  );
});
AlertDialogAction.displayName = 'AlertDialogAction';

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
};

