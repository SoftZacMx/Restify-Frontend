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

/** Campos editables de la sucursal en esta pantalla (el ticket vive en /settings/tickets). */
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
    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-muted-foreground block mb-1.5">
      {children}
    </span>
  );
}

const configCardClass =
  'rounded-xl border-slate-200 dark:border-border/80 bg-card dark:bg-background/30 shadow-sm';

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
  };
}

/**
 * Página de datos de la sucursal activa (identidad, dirección, contacto y horario).
 * Reemplaza la antigua configuración de "compañía": en multi-tenancy cada sucursal
 * tiene su propia identidad. La configuración de ticket vive en /settings/tickets.
 */
const CompanyConfigPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { selectedBranchId } = useActiveBranch();
  const [form, setForm] = useState<BranchConfigFormState>({ ...INITIAL_FORM });
  const [logoFile, setLogoFile] = useState<File | null>(null);
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
      const logoUrl = logoFile
        ? await uploadService.uploadImage(logoFile, 'branch_logo')
        : form.logoUrl;

      const payload: UpdateBranchRequest = {
        name: form.name,
        state: form.state,
        city: form.city,
        street: form.street,
        exteriorNumber: form.exteriorNumber,
        phone: form.phone,
        rfc: form.rfc,
        logoUrl,
        startOperations: form.startOperations,
        endOperations: form.endOperations,
      };
      const updated = await branchService.updateBranch(selectedBranchId, payload);
      queryClient.setQueryData(['branches', selectedBranchId, 'detail'], updated);
      setLogoFile(null);
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
    setLogoFile(null);
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
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-lg text-slate-900 dark:text-foreground">Identidad</CardTitle>
          <p className="text-sm text-slate-500 dark:text-muted-foreground">
            Nombre y logo del negocio. Aparecen en tickets y documentos donde aplique.
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-8">
            <div className="shrink-0">
              <ConfigFieldLabel>Logo</ConfigFieldLabel>
              <ImageUpload
                value={form.logoUrl}
                file={logoFile}
                onFileChange={setLogoFile}
                onChange={(url) => setForm((prev) => ({ ...prev, logoUrl: url }))}
                disabled={isSaving}
                size="lg"
                emptyAsBox
              />
              <p className="text-xs text-slate-500 dark:text-muted-foreground mt-2 max-w-40">
                PNG, JPG o WebP. Fondo transparente recomendado.
              </p>
            </div>
            <div className="flex-1 min-w-0 max-w-md">
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
              <p className="text-xs text-slate-500 dark:text-muted-foreground mt-2">
                Nombre comercial con el que se identifica esta sucursal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={configCardClass}>
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-lg text-slate-900 dark:text-foreground">
            Dirección y contacto
          </CardTitle>
          <p className="text-sm text-slate-500 dark:text-muted-foreground">
            Ubicación física, teléfono y datos fiscales de la sucursal.
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-5 md:gap-x-5">
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
          </div>
        </CardContent>
      </Card>

      <Card className={configCardClass}>
        <CardHeader className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-foreground">
            <Clock className="h-4 w-4 text-primary dark:text-sky-400 shrink-0" aria-hidden />
            Horario de operación
          </CardTitle>
          <p className="text-sm text-slate-500 dark:text-muted-foreground">
            Rango para permitir creación de órdenes según la lógica del negocio.
          </p>
        </CardHeader>
        <CardContent className="pt-2">
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
            <span className="text-sm text-slate-500 dark:text-muted-foreground">al</span>
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
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 dark:border-border/80 pt-5">
        <Button type="button" variant="outline" onClick={handleCancel} className="gap-2">
          <X className="h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
};

export default CompanyConfigPage;
