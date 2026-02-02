import React from 'react';
import { TableForm } from './TableForm';
import type { TableResponse, UpdateTableRequest } from '@/domain/types';

interface EditTableFormProps {
  tableData: TableResponse;
  onSubmit: (tableData: UpdateTableRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Wrapper de TableForm para edición de mesas
 * Simplifica el uso del formulario cuando necesitamos editar una mesa existente
 */
export const EditTableForm: React.FC<EditTableFormProps> = ({
  tableData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  return (
    <TableForm
      initialData={tableData}
      onSubmit={async (data) => {
        await onSubmit(data as UpdateTableRequest);
      }}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
};
