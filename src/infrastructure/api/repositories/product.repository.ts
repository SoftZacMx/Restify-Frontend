import apiClient from '../client';
import type { Product, ApiResponse } from '@/domain/types';

/**
 * Repository para operaciones de productos
 */
export class ProductRepository {
  /**
   * Lista productos con filtros opcionales
   */
  async listProducts(filters?: {
    search?: string;
    status?: string;
  }): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get('/api/product', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene un producto por ID
   */
  async getProductById(productId: string): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.get(`/api/product/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Exportar instancia singleton
export const productRepository = new ProductRepository();


