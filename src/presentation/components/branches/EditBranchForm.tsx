import React from 'react';
import { BranchForm } from './BranchForm';
import { BranchPublicUrl } from './BranchPublicUrl';
import type { BranchDetail, CreateBranchRequest, UpdateBranchRequest } from '@/domain/types';

interface EditBranchFormProps {
  branch: BranchDetail;
  onSubmit: (data: UpdateBranchRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/** Wrapper de BranchForm para editar; recibe el detalle completo como initialData. */
export const EditBranchForm: React.FC<EditBranchFormProps> = ({
  branch,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const handleSubmit = async (data: CreateBranchRequest | UpdateBranchRequest) => {
    await onSubmit(data as UpdateBranchRequest);
  };

  // La URL pública solo existe para sucursales activas con slug (las legacy sin backfill no lo traen).
  const showPublicUrl = branch.status === 'active' && !!branch.slug;

  return (
    <div className="space-y-6">
      {showPublicUrl && <BranchPublicUrl slug={branch.slug!} />}
      <BranchForm
        initialData={branch}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    </div>
  );
};
