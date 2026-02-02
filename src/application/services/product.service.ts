import { productRepository } from '@/infrastructure/api/repositories/product.repository';
import type {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ListProductsRequest,
} from '@/domain/types';
import { AppError } from '@/domain/errors';

/**
 * Servicio de productos
 * Contiene la lógica de negocio para operaciones de productos
 * Cumple SRP: Solo maneja lógica de negocio de productos
 */
export class ProductService {
  /**
   * Crea un nuevo producto
   * Valida los datos antes de enviarlos al repositorio
   */
  async createProduct(productData: CreateProductRequest): Promise<ProductResponse> {
    // Validaciones de negocio
    this.validateCreateProductData(productData);

    try {
      const response = await productRepository.createProduct(productData);
      if (!response.success || !response.data) {
        throw new AppError('PRODUCT_CREATION_FAILED', 'No se pudo crear el producto');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('PRODUCT_CREATION_FAILED', 'Error al crear el producto');
    }
  }

  /**
   * Obtiene un producto por ID
   */
  async getProductById(productId: string): Promise<ProductResponse> {
    if (!productId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del producto es requerido');
    }

    try {
      const response = await productRepository.getProductById(productId);
      if (!response.success || !response.data) {
        throw new AppError('PRODUCT_NOT_FOUND', 'Producto no encontrado');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('PRODUCT_FETCH_FAILED', 'Error al obtener el producto');
    }
  }

  /**
   * Lista productos con filtros opcionales
   */
  async listProducts(filters?: ListProductsRequest): Promise<ProductResponse[]> {
    try {
      const response = await productRepository.listProducts(filters);
      if (!response.success || !response.data) {
        return [];
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('PRODUCT_LIST_FAILED', 'Error al listar productos');
    }
  }

  /**
   * Actualiza un producto existente
   */
  async updateProduct(
    productId: string,
    productData: UpdateProductRequest
  ): Promise<ProductResponse> {
    if (!productId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del producto es requerido');
    }

    // Validaciones de negocio
    this.validateUpdateProductData(productData);

    try {
      const response = await productRepository.updateProduct(productId, productData);
      if (!response.success || !response.data) {
        throw new AppError('PRODUCT_UPDATE_FAILED', 'No se pudo actualizar el producto');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('PRODUCT_UPDATE_FAILED', 'Error al actualizar el producto');
    }
  }

  /**
   * Elimina un producto
   */
  async deleteProduct(productId: string): Promise<void> {
    if (!productId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del producto es requerido');
    }

    try {
      const response = await productRepository.deleteProduct(productId);
      if (!response.success) {
        throw new AppError('PRODUCT_DELETE_FAILED', 'No se pudo eliminar el producto');
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('PRODUCT_DELETE_FAILED', 'Error al eliminar el producto');
    }
  }

  /**
   * Valida los datos para crear un producto
   */
  private validateCreateProductData(productData: CreateProductRequest): void {
    if (!productData.name || productData.name.trim().length === 0) {
      throw new AppError('VALIDATION_ERROR', 'El nombre del producto es requerido');
    }

    if (productData.name.length > 200) {
      throw new AppError('VALIDATION_ERROR', 'El nombre no puede exceder 200 caracteres');
    }

    if (productData.description && productData.description.length > 1000) {
      throw new AppError('VALIDATION_ERROR', 'La descripción no puede exceder 1000 caracteres');
    }

    if (!productData.userId) {
      throw new AppError('VALIDATION_ERROR', 'El userId es requerido');
    }

    // Validar formato UUID básico
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(productData.userId)) {
      throw new AppError('VALIDATION_ERROR', 'El userId debe ser un UUID válido');
    }
  }

  /**
   * Valida los datos para actualizar un producto
   */
  private validateUpdateProductData(productData: UpdateProductRequest): void {
    if (productData.name !== undefined) {
      if (productData.name.trim().length === 0) {
        throw new AppError('VALIDATION_ERROR', 'El nombre no puede estar vacío');
      }
      if (productData.name.length > 200) {
        throw new AppError('VALIDATION_ERROR', 'El nombre no puede exceder 200 caracteres');
      }
    }

    if (productData.description !== undefined && productData.description && productData.description.length > 1000) {
      throw new AppError('VALIDATION_ERROR', 'La descripción no puede exceder 1000 caracteres');
    }
  }
}

// Exportar instancia singleton
export const productService = new ProductService();
