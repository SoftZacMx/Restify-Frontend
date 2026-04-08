import { Loader2 } from 'lucide-react';

export function PageLoader() {
  return (
    <div
      className="flex items-center justify-center h-screen bg-background"
      role="status"
      aria-label="Cargando página"
    >
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
    </div>
  );
}
