import apiClient from '../client';
import { publicApiClient } from '../public-client';
import type { ApiResponse } from '@/domain/types';
import type {
  CloseOrganizationResult,
  ReactivateOrganizationRequest,
  ReactivateOrganizationResult,
} from '@/domain/types/organization.types';

/**
 * Repository del módulo Organization.
 * Los errores de API se convierten a AppError en el interceptor.
 */
export class OrganizationRepository {
  /**
   * Cierra (soft-delete) la organización. Solo owner. El backend valida que
   * `confirmationName` coincida con el nombre de la org e invalida las sesiones.
   */
  async close(confirmationName: string): Promise<ApiResponse<CloseOrganizationResult>> {
    const response = await apiClient.post('/api/organization/close', { confirmationName });
    return response.data;
  }

  /**
   * Reactiva una organización cerrada dentro de la ventana de 30 días.
   * Endpoint público (la org está cerrada y no hay sesión válida): re-valida
   * email + password como un login. El backend setea la cookie HttpOnly.
   */
  async reactivate(
    data: ReactivateOrganizationRequest
  ): Promise<ApiResponse<ReactivateOrganizationResult>> {
    const response = await publicApiClient.post('/api/organization/reactivate', data);
    return response.data;
  }
}

export const organizationRepository = new OrganizationRepository();
