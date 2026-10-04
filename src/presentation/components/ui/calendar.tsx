import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/shared/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * Calendar
 * Wrapper de react-day-picker con los tokens de color del proyecto.
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'flex flex-col gap-4',
        month_caption: 'flex justify-center items-center h-9 relative',
        caption_label: 'text-sm font-medium text-foreground',
        nav: 'flex items-center justify-between absolute inset-x-0',
        button_previous: cn(
          'h-7 w-7 inline-flex items-center justify-center rounded-lg border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors'
        ),
        button_next: cn(
          'h-7 w-7 inline-flex items-center justify-center rounded-lg border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors'
        ),
        month_grid: 'w-full border-collapse mt-2',
        weekdays: 'flex',
        weekday: 'text-muted-foreground w-9 font-normal text-xs',
        week: 'flex w-full mt-1',
        day: 'relative p-0 text-center h-9 w-9 text-sm',
        day_button:
          'h-9 w-9 rounded-lg inline-flex items-center justify-center font-normal text-foreground hover:bg-accent hover:text-accent-foreground transition-colors aria-selected:opacity-100',
        selected: '[&>button]:bg-primary [&>button]:text-white [&>button]:hover:bg-primary/90',
        today: '[&>button]:bg-accent [&>button]:text-accent-foreground',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
