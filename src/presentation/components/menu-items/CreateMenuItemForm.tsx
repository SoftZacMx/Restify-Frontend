import React from 'react';
import { MenuItemForm } from './MenuItemForm';
import type { CreateMenuItemRequest } from '@/domain/types';

interface CreateMenuItemFormProps {
  onSubmit: (menuItemData: CreateMenuItemRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Componente CreateMenuItemForm
 * Wrapper alrededor de MenuItemForm para crear platillos
 * Reutiliza la lógica del formulario base
 */
export const CreateMenuItemForm: React.FC<CreateMenuItemFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const handleSubmit = async (menuItemData: CreateMenuItemRequest | any) => {
    await onSubmit(menuItemData as CreateMenuItemRequest);
  };

  return (
    <MenuItemForm
      initialData={null}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
};
