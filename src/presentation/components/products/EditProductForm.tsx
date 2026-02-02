import React from 'react';
import { ProductForm } from './ProductForm';
import type { ProductResponse, UpdateProductRequest } from '@/domain/types';

interface EditProductFormProps {
  product: ProductResponse;
  onSubmit: (productData: UpdateProductRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Componente EditProductForm
 * Wrapper alrededor de ProductForm para editar productos
 * Reutiliza la lógica del formulario base
 */
export const EditProductForm: React.FC<EditProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const handleSubmit = async (productData: UpdateProductRequest | any) => {
    await onSubmit(productData as UpdateProductRequest);
  };

  return (
    <ProductForm
      initialData={product}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
};
