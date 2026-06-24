import { branchRepository } from '@/infrastructure/api/repositories/branch.repository';
import type {
  BranchListItem,
  BranchDetail,
  CreateBranchRequest,
  UpdateBranchRequest,
} from '@/domain/types';
import { AppError } from '@/domain/errors';

/**
 * Servicio de sucursales.
 * Orquesta el repositorio y desempaqueta la respuesta de la API.
 * Los códigos de error del backend (BRANCH_LIMIT_REACHED, BRANCH_ALREADY_DISABLED, etc.)
 * ya llegan como AppError desde el interceptor: se re-lanzan tal cual para que la UI los
 * muestre con su mensaje específico.
 */
export class BranchService {
  /** Lista las sucursales accesibles. `includeDisabled` incluye las deshabilitadas. */
  async listBranches(includeDisabled = false): Promise<BranchListItem[]> {
    try {
      const response = await branchRepository.listBranches(includeDisabled);
      if (!response.success || !response.data) {
        return [];
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('BRANCH_LIST_FAILED');
    }
  }

  /** Obtiene el detalle completo de una sucursal. */
  async getBranch(branchId: string): Promise<BranchDetail> {
    if (!branchId) {
      throw new AppError('VALIDATION_ERROR', 'El ID de la sucursal es requerido');
    }
    try {
      const response = await branchRepository.getBranch(branchId);
      if (!response.success || !response.data) {
        throw new AppError('BRANCH_NOT_FOUND');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('BRANCH_FETCH_FAILED');
    }
  }

  /** Crea una sucursal (OWNER/ADMIN). */
  async createBranch(data: CreateBranchRequest): Promise<BranchDetail> {
    try {
      const response = await branchRepository.createBranch(data);
      if (!response.success || !response.data) {
        throw new AppError('BRANCH_CREATION_FAILED');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('BRANCH_CREATION_FAILED');
    }
  }

  /** Actualiza una sucursal (OWNER/ADMIN). */
  async updateBranch(branchId: string, data: UpdateBranchRequest): Promise<BranchDetail> {
    if (!branchId) {
      throw new AppError('VALIDATION_ERROR', 'El ID de la sucursal es requerido');
    }
    try {
      const response = await branchRepository.updateBranch(branchId, data);
      if (!response.success || !response.data) {
        throw new AppError('BRANCH_UPDATE_FAILED');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('BRANCH_UPDATE_FAILED');
    }
  }

  /** Deshabilita una sucursal (soft delete, OWNER/ADMIN). */
  async disableBranch(branchId: string): Promise<BranchDetail> {
    if (!branchId) {
      throw new AppError('VALIDATION_ERROR', 'El ID de la sucursal es requerido');
    }
    try {
      const response = await branchRepository.disableBranch(branchId);
      if (!response.success || !response.data) {
        throw new AppError('BRANCH_UPDATE_FAILED');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('BRANCH_UPDATE_FAILED');
    }
  }

  /** Reactiva una sucursal deshabilitada (OWNER/ADMIN). */
  async enableBranch(branchId: string): Promise<BranchDetail> {
    if (!branchId) {
      throw new AppError('VALIDATION_ERROR', 'El ID de la sucursal es requerido');
    }
    try {
      const response = await branchRepository.enableBranch(branchId);
      if (!response.success || !response.data) {
        throw new AppError('BRANCH_UPDATE_FAILED');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('BRANCH_UPDATE_FAILED');
    }
  }
}

export const branchService = new BranchService();
