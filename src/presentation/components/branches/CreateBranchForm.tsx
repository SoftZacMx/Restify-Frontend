import React from 'react';
import { BranchForm } from './BranchForm';
import type { CreateBranchRequest, UpdateBranchRequest } from '@/domain/types';

interface CreateBranchFormProps {
  onSubmit: (data: CreateBranchRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/** Wrapper de BranchForm para crear sucursales (sin initialData). */
export const CreateBranchForm: React.FC<CreateBranchFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const handleSubmit = async (data: CreateBranchRequest | UpdateBranchRequest) => {
    await onSubmit(data as CreateBranchRequest);
  };

  return (
    <BranchForm
      initialData={null}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
};
