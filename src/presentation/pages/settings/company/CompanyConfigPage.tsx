import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, X, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { ImageUpload } from '@/presentation/components/ui/image-upload';
import { branchService } from '@/application/services';
import { uploadService } from '@/application/services/upload.service';
import { useActiveBranch } from '@/presentation/hooks/useActiveBranch';
import type { UpdateBranchRequest } from '@/domain/types';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';
import { mergeTicketPrintConfig } from '@/shared/utils/ticket-print-config';
import type { ResolvedTicketPrintConfig } from '@/shared/utils/ticket-print-config';
import { TicketThermalConfigCard } from './TicketThermalConfigCard';

/** Campos editables de la sucursal en esta pantalla + el ticket resuelto. */
interface BranchConfigFormState {
  name: string;
  state: string;
  city: string;
  street: string;
  exteriorNumber: string;
  phone: string;
  rfc: string | null;
  logoUrl: string | null;
  startOperations: string | null;
  endOperations: string | null;
  ticketConfig: ResolvedTicketPrintConfig;
}

const INITIAL_FORM: BranchConfigFormState = {
  name: '',
  state: '',
  city: '',
  street: '',
  exteriorNumber: '',
  phone: '',
  rfc: null,
  logoUrl: null,
  startOperations: null,
  endOperations: null,
  ticketConfig: mergeTicketPrintConfig(undefined),
};

/** Normaliza "HH:mm:ss" o "H:m" a "HH:mm" para input type="time" */
function normalizeTimeForInput(value: string | null | undefined): string {
  if (value == null || value === '') return '';
  const trimmed = String(value).trim();
  if (!trimmed) return '';
  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    const h = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    return `${h}:${m}`;
  }
  return trimmed;
}

function ConfigFieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
      {children}
    </span>
  );
}

const configCardClass =
  'rounded-xl border-slate-200 dark:border-slate-700/80 bg-card dark:bg-slate-900/30 shadow-sm';

/** Mapea el detalle de la sucursal al estado del formulario. */
function branchToForm(branch: {
  name: string;
  state: string;
  city: string;
  street: string;
  exteriorNumber: string;
  phone: string;
  rfc: string | null;
  logoUrl: string | null;
  startOperations: string | null;
  endOperations: string | null;
  ticketConfig: unknown | null;
}): BranchConfigFormState {
  return {
    name: branch.name,
    state: branch.state,
    city: branch.city,
    street: branch.street,
    exteriorNumber: branch.exteriorNumber,
    phone: branch.phone,
    rfc: branch.rfc ?? null,
    logoUrl: branch.logoUrl ?? null,
    startOperations: branch.startOperations ?? null,
    endOperations: branch.endOperations ?? null,
    ticketConfig: mergeTicketPrintConfig(branch.ticketConfig),
  };
}

/**
 * Página de configuración de la sucursal activa (datos del negocio + ticket).
 * Reemplaza la antigua configuración de "compañía": en multi-tenancy cada sucursal
 * tiene su propia identidad, dirección y configuración de ticket.
 */
const CompanyConfigPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { selectedBranchId } = useActiveBranch();
  const [form, setForm] = useState<BranchConfigFormState>({ ...INITIAL_FORM });
  const [isSaving, setIsSaving] = useState(false);

  const { data: branch, isLoading } = useQuery({
    queryKey: ['branches', selectedBranchId, 'detail'],
    queryFn: () => branchService.getBranch(selectedBranchId as string),
    enabled: !!selectedBranchId,
  });

  React.useEffect(() => {
    if (branch) {
      setForm(branchToForm(branch));
    } else if (!isLoading) {
      setForm({ ...INITIAL_FORM });
    }
  }, [branch, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId) return;
    setIsSaving(true);
    try {
      const payload: UpdateBranchRequest = {
        name: form.name,
        state: form.state,
        city: form.city,
        street: form.street,
        exteriorNumber: form.exteriorNumber,
        phone: form.phone,
        rfc: form.rfc,
        logoUrl: form.logoUrl,
        startOperations: form.startOperations,
        endOperations: form.endOperations,
        ticketConfig: form.ticketConfig as unknown as Record<string, unknown>,
      };
      const updated = await branchService.updateBranch(selectedBranchId, payload);
      queryClient.setQueryData(['branches', selectedBranchId, 'detail'], updated);
      showSuccessToast('Cambios guardados', 'La información de la sucursal se actualizó correctamente.');
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al guardar', error.message);
      } else {
        showErrorToast('Error al guardar', 'No se pudieron guardar los cambios.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = useCallback(() => {
    setForm(branch ? branchToForm(branch) : { ...INITIAL_FORM });
  }, [branch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card className={configCardClass}>
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Datos del negocio</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Identidad y ubicación. Aparecen en tickets y documentos donde aplique.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <div className="md:col-span-1">
              <label htmlFor="co-name" className="contents">
                <ConfigFieldLabel>Nombre del negocio</ConfigFieldLabel>
              </label>
              <Input
                id="co-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre comercial"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="co-logo-url" className="contents">
                <ConfigFieldLabel>Logo del negocio</ConfigFieldLabel>
              </label>
              <ImageUpload
                value={form.logoUrl}
                onUpload={(file) => uploadService.uploadImage(file, 'branch_logo')}
                onChange={(url) => setForm((prev) => ({ ...prev, logoUrl: url }))}
                disabled={isSaving}
              />
            </div>

            <div>
              <label htmlFor="co-state" className="contents">
                <ConfigFieldLabel>Estado</ConfigFieldLabel>
              </label>
              <Input
                id="co-state"
                value={form.state}
                onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                placeholder="CDMX"
                required
              />
            </div>
            <div>
              <label htmlFor="co-city" className="contents">
                <ConfigFieldLabel>Ciudad</ConfigFieldLabel>
              </label>
              <Input
                id="co-city"
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Ciudad"
                required
              />
            </div>
            <div>
              <label htmlFor="co-phone" className="contents">
                <ConfigFieldLabel>Teléfono</ConfigFieldLabel>
              </label>
              <Input
                id="co-phone"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+52 …"
                required
              />
            </div>

            <div>
              <label htmlFor="co-rfc" className="contents">
                <ConfigFieldLabel>RFC</ConfigFieldLabel>
              </label>
              <Input
                id="co-rfc"
                value={form.rfc ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, rfc: e.target.value.trim() || null }))
                }
                placeholder="Opcional"
              />
            </div>
            <div>
              <label htmlFor="co-street" className="contents">
                <ConfigFieldLabel>Calle</ConfigFieldLabel>
              </label>
              <Input
                id="co-street"
                value={form.street}
                onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
                placeholder="Calle y colonia"
                required
              />
            </div>

            <div>
              <label htmlFor="co-ext" className="contents">
                <ConfigFieldLabel>No. ext</ConfigFieldLabel>
              </label>
              <Input
                id="co-ext"
                value={form.exteriorNumber}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, exteriorNumber: e.target.value }))
                }
                placeholder="123"
                required
              />
            </div>

            <div className="md:col-span-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400 shrink-0" aria-hidden />
                <ConfigFieldLabel>Horario de operación</ConfigFieldLabel>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Input
                  type="time"
                  className="w-[min(100%,160px)]"
                  value={normalizeTimeForInput(form.startOperations)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      startOperations: e.target.value ? e.target.value : null,
                    }))
                  }
                  aria-label="Hora de apertura"
                />
                <span className="text-sm text-slate-500 dark:text-slate-400">al</span>
                <Input
                  type="time"
                  className="w-[min(100%,160px)]"
                  value={normalizeTimeForInput(form.endOperations)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      endOperations: e.target.value ? e.target.value : null,
                    }))
                  }
                  aria-label="Hora de cierre"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                Rango para permitir creación de órdenes según la lógica del negocio.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <TicketThermalConfigCard
        value={form.ticketConfig}
        onChange={(ticketConfig) => setForm((prev) => ({ ...prev, ticketConfig }))}
        disabled={isSaving}
      />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          Guardar cambios
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel} className="gap-2">
          <X className="h-4 w-4" />
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default CompanyConfigPage;
