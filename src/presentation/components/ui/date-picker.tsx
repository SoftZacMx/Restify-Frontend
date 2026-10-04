import React from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/presentation/components/ui/popover';
import { Calendar } from '@/presentation/components/ui/calendar';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/shared/utils';

interface DatePickerProps {
  /** Fecha en formato ISO "yyyy-MM-dd" o '' si no hay */
  value: string;
  /** Devuelve "yyyy-MM-dd" o '' al limpiar */
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** No permitir fechas posteriores (ej. filtros "hasta hoy") */
  disabledDates?: (date: Date) => boolean;
  /** Resalta el borde en rojo (validación de formularios) */
  hasError?: boolean;
}

/**
 * DatePicker
 * Selector de fecha con calendario emergente, consistente en todos los
 * navegadores (reemplaza al input nativo type="date", que en Safari no
 * muestra calendario). Trabaja con strings "yyyy-MM-dd" como el input nativo,
 * así los filtros no cambian su formato interno.
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Elegir fecha',
  className,
  disabledDates,
  hasError,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedDate = value && isValid(parseISO(value)) ? parseISO(value) : undefined;

  return (
    <div className={cn('relative flex-1', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start gap-2 font-normal h-11 rounded-lg border-border bg-card hover:bg-accent hover:text-foreground',
              !value && 'text-muted-foreground',
              hasError && 'border-destructive'
            )}
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            {value ? format(selectedDate!, 'dd/MM/yyyy') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              onChange(date ? format(date, 'yyyy-MM-dd') : '');
              setIsOpen(false);
            }}
            disabled={disabledDates}
          />
        </PopoverContent>
      </Popover>
      {value && (
        <button
          type="button"
          aria-label="Limpiar fecha"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
