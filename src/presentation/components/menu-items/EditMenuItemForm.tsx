import React from 'react';
import { MenuItemForm } from './MenuItemForm';
import type { MenuItemResponse, UpdateMenuItemRequest } from '@/domain/types';

interface EditMenuItemFormProps {
  menuItem: MenuItemResponse;
  onSubmit: (menuItemData: UpdateMenuItemRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Componente EditMenuItemForm
 * Wrapper alrededor de MenuItemForm para editar platillos
 * Reutiliza la lógica del formulario base
 */
export const EditMenuItemForm: React.FC<EditMenuItemFormProps> = ({
  menuItem,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const handleSubmit = async (menuItemData: UpdateMenuItemRequest | any) => {
    await onSubmit(menuItemData as UpdateMenuItemRequest);
  };

  return (
    <MenuItemForm
      initialData={menuItem}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
};
