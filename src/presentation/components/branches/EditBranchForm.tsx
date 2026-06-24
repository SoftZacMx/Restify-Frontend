import React from 'react';
import { BranchForm } from './BranchForm';
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

  return (
    <BranchForm
      initialData={branch}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
};
