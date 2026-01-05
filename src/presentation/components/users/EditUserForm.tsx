import React from 'react';
import { UserForm } from './UserForm';
import type { UpdateUserRequest, User } from '@/domain/types';

interface EditUserFormProps {
  user: User;
  onSubmit: (userData: UpdateUserRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Componente EditUserForm
 * Wrapper alrededor de UserForm para editar usuarios
 * Reutiliza la lógica del formulario base
 */
export const EditUserForm: React.FC<EditUserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const handleSubmit = async (userData: UpdateUserRequest | any) => {
    await onSubmit(userData as UpdateUserRequest);
  };

  return (
    <UserForm
      initialData={user}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
};

