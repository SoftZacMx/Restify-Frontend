import { Check } from 'lucide-react';
import { cn } from '@/shared/utils';

export interface StepperStep {
  /** Identificador del paso (debe coincidir con el estado del wizard). */
  id: string;
  /** Etiqueta visible debajo del círculo. */
  label: string;
}

interface StepperProps {
  steps: StepperStep[];
  /** Índice del paso activo (0-based). */
  currentStep: number;
  /** Se dispara al hacer clic en un paso ya completado (anterior al activo). */
  onStepClick?: (index: number) => void;
}

/**
 * Indicador de progreso por pasos: círculos numerados unidos por una línea.
 * El paso activo se resalta en azul; los completados muestran una palomita y son clicables.
 */
export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="flex items-center justify-center w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isClickable = isCompleted && !!onStepClick;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(index)}
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors',
                  isActive && 'border-blue-600 bg-blue-600 text-white',
                  isCompleted && 'border-blue-600 bg-blue-600 text-white',
                  !isActive && !isCompleted && 'border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500',
                  isClickable ? 'cursor-pointer hover:bg-blue-700 hover:border-blue-700' : 'cursor-default'
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
              </button>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isActive || isCompleted
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400 dark:text-slate-500'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Línea conectora (no se dibuja después del último paso) */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-0.5 w-16 sm:w-24 -translate-y-3 transition-colors',
                  index < currentStep ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
