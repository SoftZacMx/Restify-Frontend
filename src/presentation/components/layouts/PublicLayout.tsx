import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface PublicLayoutProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * Layout público sin sidebar, sin auth.
 * Header con logo y nombre del restaurante + contenido principal.
 */
export const PublicLayout: React.FC<PublicLayoutProps> = ({ children, title = 'Menú' }) => {
  return (
    <div className="min-h-screen bg-muted font-sans text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
            <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-h3 text-foreground">
            {title}
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
