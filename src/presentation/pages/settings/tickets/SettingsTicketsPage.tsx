import React, { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, X } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { branchService } from '@/application/services';
import { useActiveBranch } from '@/presentation/hooks/useActiveBranch';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';
import { mergeTicketPrintConfig } from '@/shared/utils/ticket-print-config';
import type { ResolvedTicketPrintConfig } from '@/shared/utils/ticket-print-config';
import { TicketThermalConfigCard } from './TicketThermalConfigCard';

/**
 * Configuración de impresión de la sucursal activa.
 * Dueña de los datos (consulta, estado y guardado); la card solo dibuja los controles.
 */
const SettingsTicketsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { selectedBranchId } = useActiveBranch();
  const [ticketConfig, setTicketConfig] = useState<ResolvedTicketPrintConfig>(
    mergeTicketPrintConfig(undefined)
  );
  const [isSaving, setIsSaving] = useState(false);

  const { data: branch, isLoading } = useQuery({
    queryKey: ['branches', selectedBranchId, 'detail'],
    queryFn: () => branchService.getBranch(selectedBranchId as string),
    enabled: !!selectedBranchId,
  });

  useEffect(() => {
    setTicketConfig(mergeTicketPrintConfig(branch?.ticketConfig));
  }, [branch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId) return;
    setIsSaving(true);
    try {
      // PATCH parcial: solo viaja el ticket, los datos del negocio quedan intactos.
      const updated = await branchService.updateBranch(selectedBranchId, {
        ticketConfig: ticketConfig as unknown as Record<string, unknown>,
      });
      queryClient.setQueryData(['branches', selectedBranchId, 'detail'], updated);
      showSuccessToast(
        'Cambios guardados',
        'La configuración de ticket se actualizó correctamente.'
      );
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
    setTicketConfig(mergeTicketPrintConfig(branch?.ticketConfig));
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
      <TicketThermalConfigCard
        value={ticketConfig}
        onChange={setTicketConfig}
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

export default SettingsTicketsPage;
