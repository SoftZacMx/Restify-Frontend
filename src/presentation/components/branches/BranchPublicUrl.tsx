import React, { useState } from 'react';
import { Check, Copy, ExternalLink, Globe } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';

interface BranchPublicUrlProps {
  slug: string;
}

/**
 * Muestra la URL pública del menú (`/menu/<slug>`) con acciones de copiar y abrir.
 * El padre decide cuándo renderizarla (solo sucursal activa con slug).
 */
export const BranchPublicUrl: React.FC<BranchPublicUrlProps> = ({ slug }) => {
  const [copied, setCopied] = useState(false);
  const publicUrl = `${window.location.origin}/menu/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      showSuccessToast('URL copiada', 'El enlace del menú público está en tu portapapeles');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showErrorToast('No se pudo copiar', 'Copia el enlace manualmente');
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">
          Menú público
        </h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Comparte este enlace con tus clientes para que vean el menú de la sucursal.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <code className="flex-1 truncate rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
          {publicUrl}
        </code>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleCopy} className="shrink-0">
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(publicUrl, '_blank', 'noopener,noreferrer')}
            className="shrink-0"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir
          </Button>
        </div>
      </div>
    </div>
  );
};
