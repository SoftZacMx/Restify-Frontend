import React from 'react';
import { TableForm } from './TableForm';
import type { CreateTableRequest } from '@/domain/types';

interface CreateTableFormProps {
  onSubmit: (tableData: CreateTableRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  userId: string;
}

/**
 * Wrapper de TableForm para creación de mesas
 * Simplifica el uso del formulario cuando solo necesitamos crear
 */
export const CreateTableForm: React.FC<CreateTableFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  userId,
}) => {
  return (
    <TableForm
      initialData={null}
      onSubmit={async (data) => {
        await onSubmit(data as CreateTableRequest);
      }}
      onCancel={onCancel}
      isLoading={isLoading}
      userId={userId}
    />
  );
};
