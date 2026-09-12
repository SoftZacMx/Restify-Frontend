import React from 'react';
import {
  Building2,
  Phone,
  FileText,
  MapPin,
  Clock,
  CreditCard,
  CalendarPlus,
  CalendarClock,
} from 'lucide-react';
import { Badge } from '@/presentation/components/ui/badge';
import { BranchPublicUrl } from './BranchPublicUrl';
import { cn } from '@/shared/lib/utils';
import type { BranchDetail } from '@/domain/types';

interface BranchDetailViewProps {
  branch: BranchDetail;
}

const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatSchedule = (start: string | null, end: string | null): string => {
  if (!start && !end) return 'Sin horario definido';
  return `${start ?? '—'} - ${end ?? '—'}`;
};

/** Fila etiqueta/valor con ícono, reutilizada dentro de cada tarjeta. */
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-slate-400 dark:text-muted-foreground">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-muted-foreground">
        {label}
      </p>
      <p className="text-sm text-slate-900 dark:text-foreground break-words">{value}</p>
    </div>
  </div>
);

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-background-dark p-5 space-y-4">
    <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">{title}</h3>
    {children}
  </div>
);

/**
 * Vista de detalle de una sucursal (solo lectura). Pinta los campos del contrato
 * `BranchDetail`; los datos sensibles (`paymentConfig`/`ticketConfig`) no se renderizan
 * crudos, solo el indicador derivado `hasPaymentConfig`.
 */
export const BranchDetailView: React.FC<BranchDetailViewProps> = ({ branch }) => {
  const isActive = branch.status === 'active';
  const showPublicUrl = isActive && !!branch.slug;

  return (
    <div className="space-y-5">
      {/* Encabezado: logo + nombre + estado */}
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-border bg-slate-100 dark:bg-card overflow-hidden">
          {branch.logoUrl ? (
            <img src={branch.logoUrl} alt={branch.name} className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-7 w-7 text-slate-400 dark:text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 space-y-1">
          <Badge
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
              isActive
                ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
            )}
          >
            {isActive ? 'Activa' : 'Deshabilitada'}
          </Badge>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
            {branch.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-muted-foreground">ID: {branch.id}</p>
        </div>
      </div>

      {/* URL pública (solo sucursal activa con slug) */}
      {showPublicUrl && <BranchPublicUrl slug={branch.slug as string} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contacto e identificación */}
        <SectionCard title="Contacto e identificación">
          <InfoRow icon={<Phone className="h-4 w-4" />} label="Teléfono" value={branch.phone} />
          <InfoRow icon={<FileText className="h-4 w-4" />} label="RFC" value={branch.rfc ?? '—'} />
        </SectionCard>

        {/* Ubicación */}
        <SectionCard title="Ubicación">
          <InfoRow
            icon={<MapPin className="h-4 w-4" />}
            label="Dirección"
            value={`${branch.street} ${branch.exteriorNumber}`}
          />
          <InfoRow
            icon={<MapPin className="h-4 w-4" />}
            label="Ciudad / Estado"
            value={`${branch.city}, ${branch.state}`}
          />
        </SectionCard>

        {/* Operación */}
        <SectionCard title="Operación">
          <InfoRow
            icon={<Clock className="h-4 w-4" />}
            label="Horario"
            value={formatSchedule(branch.startOperations, branch.endOperations)}
          />
        </SectionCard>

        {/* Métricas y sistema */}
        <SectionCard title="Métricas y sistema">
          <InfoRow
            icon={<CreditCard className="h-4 w-4" />}
            label="Pagos"
            value={branch.hasPaymentConfig ? 'Configurado' : 'Sin configurar'}
          />
          <InfoRow
            icon={<CalendarPlus className="h-4 w-4" />}
            label="Creada"
            value={formatDate(branch.createdAt)}
          />
          <InfoRow
            icon={<CalendarClock className="h-4 w-4" />}
            label="Actualizada"
            value={formatDate(branch.updatedAt)}
          />
        </SectionCard>
      </div>
    </div>
  );
};
