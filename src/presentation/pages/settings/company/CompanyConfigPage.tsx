import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog';
import { companyService } from '@/application/services';
import type { UpsertCompanyRequest } from '@/domain/types';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';
import { cn } from '@/shared/lib/utils';

const INITIAL_FORM: UpsertCompanyRequest = {
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

/**
 * Página de configuración de la compañía.
 * Muestra card de logo (subir URL / eliminar) y card de detalles del negocio con formulario.
 */
const CompanyConfigPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<UpsertCompanyRequest>({ ...INITIAL_FORM });
  const [isSaving, setIsSaving] = useState(false);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState('');

  const { data: company, isLoading } = useQuery({
    queryKey: ['company'],
    queryFn: () => companyService.getCompany(),
  });

  // Sincronizar formulario cuando carga la compañía
  React.useEffect(() => {
    if (company) {
      const startOp = company.startOperations ?? null;
      const endOp = company.endOperations ?? null;
      setForm({
        name: company.name,
        state: company.state,
        city: company.city,
        street: company.street,
        exteriorNumber: company.exteriorNumber,
        phone: company.phone,
        rfc: company.rfc ?? null,
        logoUrl: company.logoUrl ?? null,
        startOperations: startOp,
        endOperations: endOp,
      });
    } else if (!isLoading) {
      setForm({ ...INITIAL_FORM });
    }
  }, [company, isLoading]);

  const handleSaveLogoUrl = useCallback(() => {
    const url = logoUrlInput.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      showErrorToast('URL inválida', 'Ingresa una URL válida para el logo.');
      return;
    }
    setForm((prev) => ({ ...prev, logoUrl: url }));
    setLogoUrlInput('');
    setIsLogoDialogOpen(false);
  }, [logoUrlInput]);

  const handleRemoveLogo = useCallback(() => {
    setForm((prev) => ({ ...prev, logoUrl: null }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await companyService.upsertCompany(form);
      queryClient.setQueryData(['company'], updated);
      showSuccessToast('Cambios guardados', 'La información de la compañía se actualizó correctamente.');
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
    if (company) {
      setForm({
        name: company.name,
        state: company.state,
        city: company.city,
        street: company.street,
        exteriorNumber: company.exteriorNumber,
        phone: company.phone,
        rfc: company.rfc ?? null,
        logoUrl: company.logoUrl ?? null,
        startOperations: company.startOperations ?? null,
        endOperations: company.endOperations ?? null,
      });
    } else {
      setForm({ ...INITIAL_FORM });
    }
  }, [company]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card: Logo de la Compañía */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Logo de la Compañía</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                'w-32 h-32 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800',
                form.logoUrl ? 'border-slate-200 dark:border-slate-600' : 'border-slate-300 dark:border-slate-600'
              )}
            >
              {form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-slate-400 dark:text-slate-500 text-xs text-center px-2">
                  Sin logo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-[200px]">
              Formatos permitidos: PNG, JPG. Máximo 2MB.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled
                onClick={() => {
                  setLogoUrlInput(form.logoUrl ?? '');
                  setIsLogoDialogOpen(true);
                }}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Subir nuevo logo
              </Button>
              {form.logoUrl && (
                <Button type="button" variant="outline" onClick={handleRemoveLogo} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              )}
            </div>
          </div>
          {form.name && (
            <p className="text-slate-700 dark:text-slate-300 font-medium mt-2 sm:mt-0">{form.name}</p>
          )}
        </CardContent>
      </Card>

      {/* Card: Detalles del Negocio */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Detalles del Negocio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nombre de la Compañía
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre del negocio"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  RFC (Identificación Fiscal)
                </label>
                <Input
                  value={form.rfc ?? ''}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, rfc: e.target.value.trim() || null }))
                  }
                  placeholder="Ingresa el RFC"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Teléfono
                </label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+52 55 1234 5678"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Estado / Provincia
                </label>
                <Input
                  value={form.state}
                  onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="CDMX"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Ciudad
                </label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="Ciudad de México"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Calle
                </label>
                <Input
                  value={form.street}
                  onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
                  placeholder="Av. Principal"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Número Exterior
                </label>
                <Input
                  value={form.exteriorNumber}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, exteriorNumber: e.target.value }))
                  }
                  placeholder="123"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Hora inicio de operaciones
                </label>
                <Input
                  type="time"
                  value={normalizeTimeForInput(form.startOperations)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      startOperations: e.target.value ? e.target.value : null,
                    }))
                  }
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Horario en que abre el negocio. Se usará para validar creación de órdenes.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Hora fin de operaciones
                </label>
                <Input
                  type="time"
                  value={normalizeTimeForInput(form.endOperations)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      endOperations: e.target.value ? e.target.value : null,
                    }))
                  }
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Horario en que cierra. Las órdenes solo se podrán crear dentro de este rango.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={isSaving} className="gap-2">
                <Save className="h-4 w-4" />
                Guardar Cambios
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} className="gap-2">
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Dialog: URL del logo */}
      <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>URL del logo</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ingresa la URL de la imagen del logo (por ejemplo, desde un almacenamiento en la nube).
          </p>
          <Input
            value={logoUrlInput}
            onChange={(e) => setLogoUrlInput(e.target.value)}
            placeholder="https://..."
            type="url"
            className="mt-2"
          />
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsLogoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveLogoUrl}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyConfigPage;
