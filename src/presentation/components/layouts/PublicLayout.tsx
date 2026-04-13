import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout público sin sidebar, sin auth.
 * Header con logo y nombre del restaurante + contenido principal.
 */
export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
            <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            Menú
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};
