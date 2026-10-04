import React from 'react';

/**
 * Props del componente PageHeader
 */
interface PageHeaderProps {
  title: string;
  description?: string;
  /** Badge junto al título (ej. estado "Edición"/"Pago") */
  titleBadge?: React.ReactNode;
  /** Acciones alineadas a la derecha (botones, indicadores, etc.) */
  children?: React.ReactNode;
}

/**
 * PageHeader
 * Encabezado único para las páginas: centraliza el diseño del título
 * y su alineación con las acciones, para no repetir el patrón en cada página.
 */
export const PageHeader = ({ title, description, titleBadge, children }: PageHeaderProps) => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="text-h1 md:text-display text-foreground">{title}</h1>
          {titleBadge}
        </div>
        {description && (
          <p className="text-body text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-shrink-0">{children}</div>
      )}
    </header>
  );
};
