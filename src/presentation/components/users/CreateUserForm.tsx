import React from 'react';
import { UserForm } from './UserForm';
import type { CreateUserRequest } from '@/domain/types';

interface CreateUserFormProps {
  onSubmit: (userData: CreateUserRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Componente CreateUserForm
 * Wrapper alrededor de UserForm para crear usuarios
 * Reutiliza la lógica del formulario base
 */
export const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const handleSubmit = async (userData: CreateUserRequest | any) => {
    await onSubmit(userData as CreateUserRequest);
  };

  return (
    <UserForm
      initialData={null}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
};

