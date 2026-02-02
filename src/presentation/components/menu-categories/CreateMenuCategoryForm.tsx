import React from 'react';
import { MenuCategoryForm } from './MenuCategoryForm';
import type { CreateMenuCategoryRequest } from '@/domain/types';

interface CreateMenuCategoryFormProps {
  onSubmit: (categoryData: CreateMenuCategoryRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Componente CreateMenuCategoryForm
 * Wrapper alrededor de MenuCategoryForm para crear categorías
 * Reutiliza la lógica del formulario base
 */
export const CreateMenuCategoryForm: React.FC<CreateMenuCategoryFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const handleSubmit = async (categoryData: CreateMenuCategoryRequest | any) => {
    await onSubmit(categoryData as CreateMenuCategoryRequest);
  };

  return (
    <MenuCategoryForm
      initialData={null}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
};
