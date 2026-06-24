import apiClient from '../client';
import type {
  ApiResponse,
  BranchListItem,
  BranchDetail,
  CreateBranchRequest,
  UpdateBranchRequest,
} from '@/domain/types';

/**
 * Repository de sucursales (admin). Usa el cliente autenticado.
 * NO confundir con `public-branch.repository.ts` (resolución pública por slug).
 * Los errores de API ya se convierten a AppError en el interceptor.
 */
export class BranchRepository {
  /** Lista las sucursales accesibles para el usuario. */
  async listBranches(includeDisabled = false): Promise<ApiResponse<BranchListItem[]>> {
    const response = await apiClient.get('/api/branches', {
      params: { includeDisabled: String(includeDisabled) },
    });
    return response.data;
  }

  /** Obtiene el detalle completo de una sucursal. */
  async getBranch(branchId: string): Promise<ApiResponse<BranchDetail>> {
    const response = await apiClient.get(`/api/branches/${branchId}`);
    return response.data;
  }

  /** Crea una sucursal (OWNER/ADMIN). */
  async createBranch(data: CreateBranchRequest): Promise<ApiResponse<BranchDetail>> {
    const response = await apiClient.post('/api/branches', data);
    return response.data;
  }

  /** Actualiza una sucursal (OWNER/ADMIN). */
  async updateBranch(
    branchId: string,
    data: UpdateBranchRequest
  ): Promise<ApiResponse<BranchDetail>> {
    const response = await apiClient.patch(`/api/branches/${branchId}`, data);
    return response.data;
  }

  /** Deshabilita una sucursal (soft delete, OWNER/ADMIN). */
  async disableBranch(branchId: string): Promise<ApiResponse<BranchDetail>> {
    const response = await apiClient.post(`/api/branches/${branchId}/disable`);
    return response.data;
  }

  /** Reactiva una sucursal deshabilitada (OWNER/ADMIN). */
  async enableBranch(branchId: string): Promise<ApiResponse<BranchDetail>> {
    const response = await apiClient.post(`/api/branches/${branchId}/enable`);
    return response.data;
  }
}

export const branchRepository = new BranchRepository();
