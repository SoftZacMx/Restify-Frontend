import React from 'react';
import { ProductForm } from './ProductForm';
import type { CreateProductRequest } from '@/domain/types';

interface CreateProductFormProps {
  onSubmit: (productData: CreateProductRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Componente CreateProductForm
 * Wrapper alrededor de ProductForm para crear productos
 * Reutiliza la lógica del formulario base
 */
export const CreateProductForm: React.FC<CreateProductFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const handleSubmit = async (productData: CreateProductRequest | any) => {
    await onSubmit(productData as CreateProductRequest);
  };

  return (
    <ProductForm
      initialData={null}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
};
