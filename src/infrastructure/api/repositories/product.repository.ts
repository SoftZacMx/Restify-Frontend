import apiClient from '../client';
import type {
  ApiResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductResponse,
  ListProductsRequest,
} from '@/domain/types';

/**
 * Repository para operaciones de productos (CRUD)
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Los errores de API se convierten automáticamente a AppError en el interceptor
 */
export class ProductRepository {
  /**
   * Crea un nuevo producto
   */
  async createProduct(productData: CreateProductRequest): Promise<ApiResponse<ProductResponse>> {
    try {
      const response = await apiClient.post('/api/products', productData);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Obtiene un producto por ID
   */
  async getProductById(productId: string): Promise<ApiResponse<ProductResponse>> {
    try {
      const response = await apiClient.get(`/api/products/${productId}`);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Lista productos con filtros opcionales.
   * Normaliza la respuesta: acepta array directo, { success, data } o { success, data: { data } }.
   */
  async listProducts(filters?: ListProductsRequest): Promise<ApiResponse<ProductResponse[]>> {
    try {
      const params: Record<string, string> = {};
      if (filters?.status !== undefined) {
        params.status = String(filters.status);
      }
      if (filters?.userId) {
        params.userId = filters.userId;
      }
      if (filters?.search) {
        params.search = filters.search;
      }
      const response = await apiClient.get('/api/products', { params });
      const body = response.data as unknown;

      if (Array.isArray(body)) {
        return { success: true, data: body, timestamp: new Date().toISOString() };
      }
      if (body && typeof body === 'object' && 'data' in (body as object)) {
        const b = body as ApiResponse<ProductResponse[] | { data?: ProductResponse[] }>;
        const inner = b.data;
        if (Array.isArray(inner)) {
          return { success: true, data: inner, timestamp: (body as ApiResponse<unknown>).timestamp ?? new Date().toISOString() };
        }
        if (inner && typeof inner === 'object' && inner !== null && 'data' in inner && Array.isArray((inner as { data: ProductResponse[] }).data)) {
          const arr = (inner as { data: ProductResponse[] }).data;
          return { success: true, data: arr, timestamp: (body as ApiResponse<unknown>).timestamp ?? new Date().toISOString() };
        }
      }
      return { success: true, data: [], timestamp: new Date().toISOString() };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza un producto existente
   */
  async updateProduct(
    productId: string,
    productData: UpdateProductRequest
  ): Promise<ApiResponse<ProductResponse>> {
    try {
      const response = await apiClient.put(`/api/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Elimina un producto
   */
  async deleteProduct(productId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/api/products/${productId}`);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }
}

// Exportar instancia singleton
export const productRepository = new ProductRepository();


