import React, { useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import { FormDialog } from '@/presentation/components/ui/form-dialog';
import { Pagination } from '@/presentation/components/ui/pagination';
import { ConfirmDialog } from '@/presentation/components/ui/confirm-dialog';
import { BranchSearchBar } from '@/presentation/components/branches/BranchSearchBar';
import { BranchTable, type BranchAction } from '@/presentation/components/branches/BranchTable';
import { CreateBranchForm } from '@/presentation/components/branches/CreateBranchForm';
import { EditBranchForm } from '@/presentation/components/branches/EditBranchForm';
import { BranchDetailView } from '@/presentation/components/branches/BranchDetailView';
import { useCrudList } from '@/presentation/hooks/useCrudList';
import { useDialogState } from '@/presentation/hooks/useDialogState';
import { branchService } from '@/application/services';
import { useAuthStore } from '@/presentation/store/auth.store';
import type {
  BranchListItem,
  BranchFilters,
  BranchDetail,
  CreateBranchRequest,
  UpdateBranchRequest,
} from '@/domain/types';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

/** Solo OWNER/ADMIN pueden crear/editar sucursales (el backend lo exige igual). */
const canWriteRoles = ['OWNER', 'ADMIN'];

const filterAdapter = (filters: BranchFilters) => ({
  includeDisabled: filters.includeDisabled,
});

const clientFilter = (data: BranchListItem[], filters: BranchFilters) => {
  const q = filters.search.trim().toLowerCase();
  if (!q) return data;
  return data.filter(
    (b) => b.name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q)
  );
};

const BranchesPage: React.FC = () => {
  const { user } = useAuthStore();
  const setBranches = useAuthStore((s) => s.setBranches);
  const canWrite = canWriteRoles.includes(user?.rol ?? '');

  const {
    rawData,
    paginatedData,
    isLoading,
    error,
    filters,
    setFilters,
    paginationData,
    pageSizeOptions,
    handlePageChange,
    handlePageSizeChange,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isCreating,
    setIsCreating,
    invalidate,
  } = useCrudList<BranchListItem, BranchFilters, { includeDisabled: boolean }>({
    queryKey: 'branches',
    queryFn: (apiFilters) => branchService.listBranches(apiFilters.includeDisabled),
    initialFilters: { search: '', includeDisabled: false },
    filterAdapter,
    clientFilter,
  });

  // Edición: el detalle se carga on-demand (la lista no trae todos los campos).
  const [editingBranch, setEditingBranch] = useState<BranchDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Ver detalle (solo lectura): mismo patrón on-demand que la edición.
  const [viewingBranch, setViewingBranch] = useState<BranchDetail | null>(null);
  const [isLoadingView, setIsLoadingView] = useState(false);

  // Habilitar / deshabilitar (soft delete): confirmación + mutación.
  const disableDialog = useDialogState<BranchListItem>();
  const enableDialog = useDialogState<BranchListItem>();
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  React.useEffect(() => {
    if (error) {
      showErrorToast(
        'Error al cargar sucursales',
        error instanceof AppError
          ? error.message
          : 'No se pudieron obtener las sucursales del servidor'
      );
    }
  }, [error]);

  // Mantener auth.store.branches sincronizado con el listado del backend.
  // Esto asegura que crear/deshabilitar/habilitar sucursales se refleje en el
  // sidebar (hasMultipleBranches) y en la pantalla de selección.
  React.useEffect(() => {
    if (rawData.length > 0) {
      setBranches(
        rawData
          .filter((b) => b.status === 'active')
          .map((b) => ({ id: b.id, name: b.name }))
      );
    }
  }, [rawData, setBranches]);

  const handleBranchAction = useCallback(
    async (branchId: string, action: BranchAction) => {
      const branch = rawData.find((b) => b.id === branchId);

      if (action === 'edit') {
        setIsLoadingDetail(true);
        try {
          const detail = await branchService.getBranch(branchId);
          setEditingBranch(detail);
        } catch (err) {
          showErrorToast(
            'Error al cargar la sucursal',
            err instanceof AppError ? err.message : 'Intentalo de nuevo'
          );
        } finally {
          setIsLoadingDetail(false);
        }
        return;
      }

      if (action === 'disable' && branch) {
        disableDialog.open(branch);
        return;
      }

      if (action === 'enable' && branch) {
        enableDialog.open(branch);
        return;
      }

      if (action === 'view') {
        setIsLoadingView(true);
        try {
          const detail = await branchService.getBranch(branchId);
          setViewingBranch(detail);
        } catch (err) {
          showErrorToast(
            'Error al cargar la sucursal',
            err instanceof AppError ? err.message : 'Intentalo de nuevo'
          );
        } finally {
          setIsLoadingView(false);
        }
      }
    },
    [rawData, disableDialog, enableDialog]
  );

  const handleCreateBranch = async (data: CreateBranchRequest) => {
    setIsCreating(true);
    try {
      await branchService.createBranch(data);
      setIsCreateModalOpen(false);
      showSuccessToast('Sucursal creada', 'La nueva sucursal se agregó correctamente');
      invalidate();
    } catch (err) {
      showErrorToast(
        'Error al crear sucursal',
        err instanceof AppError ? err.message : 'Ocurrió un error inesperado'
      );
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateBranch = async (data: UpdateBranchRequest) => {
    if (!editingBranch) return;
    setIsUpdating(true);
    try {
      await branchService.updateBranch(editingBranch.id, data);
      setEditingBranch(null);
      showSuccessToast('Sucursal actualizada', 'Los cambios se guardaron correctamente');
      invalidate();
    } catch (err) {
      showErrorToast(
        'Error al actualizar sucursal',
        err instanceof AppError ? err.message : 'Ocurrió un error inesperado'
      );
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDisable = async () => {
    if (!disableDialog.data) return;
    setIsTogglingStatus(true);
    try {
      await branchService.disableBranch(disableDialog.data.id);
      showSuccessToast('Sucursal deshabilitada', `"${disableDialog.data.name}" dejó de operar`);
      invalidate();
      disableDialog.close();
    } catch (err) {
      showErrorToast(
        'Error al deshabilitar sucursal',
        err instanceof AppError ? err.message : 'Ocurrió un error inesperado'
      );
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleConfirmEnable = async () => {
    if (!enableDialog.data) return;
    setIsTogglingStatus(true);
    try {
      await branchService.enableBranch(enableDialog.data.id);
      showSuccessToast('Sucursal habilitada', `"${enableDialog.data.name}" volvió a estar activa`);
      invalidate();
      enableDialog.close();
    } catch (err) {
      showErrorToast(
        'Error al habilitar sucursal',
        err instanceof AppError ? err.message : 'Ocurrió un error inesperado'
      );
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <MainLayout>
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sucursales</h1>
            <p className="text-sm text-muted-foreground">
              Gestión y control centralizado de unidades operativas
            </p>
          </div>
          {canWrite && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva sucursal
            </Button>
          )}
        </div>

        <BranchSearchBar filters={filters} onFiltersChange={setFilters} />

        <BranchTable
          branches={paginatedData}
          isLoading={isLoading}
          canWrite={canWrite}
          onBranchAction={handleBranchAction}
        />

        {paginationData.totalItems > 0 && (
          <Pagination
            currentPage={paginationData.currentPage}
            totalPages={paginationData.totalPages}
            totalItems={paginationData.totalItems}
            itemsPerPage={paginationData.itemsPerPage}
            itemsLabel="sucursales"
            pageSizeOptions={pageSizeOptions}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        {/* Crear */}
        <FormDialog
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Crear nueva sucursal"
          description="Configura los detalles operativos y de ubicación para tu nueva sede."
        >
          <CreateBranchForm
            onSubmit={handleCreateBranch}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isCreating}
          />
        </FormDialog>

        {/* Editar */}
        <FormDialog
          open={!!editingBranch || isLoadingDetail}
          onClose={() => setEditingBranch(null)}
          title="Editar sucursal"
          description="Actualiza los detalles operativos y de ubicación de la sede."
        >
          {editingBranch ? (
            <EditBranchForm
              branch={editingBranch}
              onSubmit={handleUpdateBranch}
              onCancel={() => setEditingBranch(null)}
              isLoading={isUpdating}
            />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">Cargando sucursal...</p>
          )}
        </FormDialog>

        {/* Ver detalle (solo lectura) */}
        <FormDialog
          open={!!viewingBranch || isLoadingView}
          onClose={() => setViewingBranch(null)}
          title="Detalle de sucursal"
          description="Información general, ubicación y operación de la sede."
        >
          {viewingBranch ? (
            <>
              <BranchDetailView branch={viewingBranch} />
              {canWrite && (
                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingBranch(viewingBranch);
                      setViewingBranch(null);
                    }}
                  >
                    Editar
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">Cargando sucursal...</p>
          )}
        </FormDialog>

        {/* Deshabilitar (destructivo) */}
        <ConfirmDialog
          open={disableDialog.isOpen}
          onClose={disableDialog.close}
          title="¿Deshabilitar sucursal?"
          description={
            disableDialog.data && (
              <>
                Estás a punto de deshabilitar{' '}
                <strong className="text-slate-900 dark:text-white">{disableDialog.data.name}</strong>.
                <br />
                <br />
                La sucursal dejará de operar y su menú público dejará de estar disponible. Podrás
                volver a habilitarla más tarde.
              </>
            )
          }
          confirmLabel="Deshabilitar"
          variant="destructive"
          isLoading={isTogglingStatus}
          onConfirm={handleConfirmDisable}
        />

        {/* Habilitar */}
        <ConfirmDialog
          open={enableDialog.isOpen}
          onClose={enableDialog.close}
          title="¿Habilitar sucursal?"
          description={
            enableDialog.data && (
              <>
                Estás a punto de habilitar{' '}
                <strong className="text-slate-900 dark:text-white">{enableDialog.data.name}</strong>.
                <br />
                <br />
                La sucursal volverá a operar y su menú público estará disponible de nuevo.
              </>
            )
          }
          confirmLabel="Habilitar"
          variant="default"
          isLoading={isTogglingStatus}
          onConfirm={handleConfirmEnable}
        />
      </section>
    </MainLayout>
  );
};

export default BranchesPage;
