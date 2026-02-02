import React from 'react';
import { MenuCategoryForm } from './MenuCategoryForm';
import type { MenuCategoryResponse, UpdateMenuCategoryRequest } from '@/domain/types';

interface EditMenuCategoryFormProps {
  category: MenuCategoryResponse;
  onSubmit: (categoryData: UpdateMenuCategoryRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Componente EditMenuCategoryForm
 * Wrapper alrededor de MenuCategoryForm para editar categorías
 * Reutiliza la lógica del formulario base
 */
export const EditMenuCategoryForm: React.FC<EditMenuCategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const handleSubmit = async (categoryData: UpdateMenuCategoryRequest | any) => {
    await onSubmit(categoryData as UpdateMenuCategoryRequest);
  };

  return (
    <MenuCategoryForm
      initialData={category}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
};
