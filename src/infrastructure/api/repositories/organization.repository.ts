import apiClient from '../client';
import { publicApiClient } from '../public-client';
import type { ApiResponse } from '@/domain/types';
import type {
  CloseOrganizationResult,
  RequestReactivationRequest,
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
   * Paso 1: solicita por correo el enlace de reactivación. Endpoint público.
   * Respuesta uniforme (200) exista o no la cuenta (anti-enumeración).
   */
  async requestReactivation(
    data: RequestReactivationRequest
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await publicApiClient.post('/api/organization/request-reactivation', data);
    return response.data;
  }

  /**
   * Paso 2: confirma la reactivación con el token del correo. Endpoint público.
   * El backend valida el token, reactiva la org (si sigue cerrada y dentro de la
   * ventana de 30 días) y setea la cookie HttpOnly con la sesión del owner.
   */
  async reactivate(
    data: ReactivateOrganizationRequest
  ): Promise<ApiResponse<ReactivateOrganizationResult>> {
    const response = await publicApiClient.post('/api/organization/reactivate', data);
    return response.data;
  }
}

export const organizationRepository = new OrganizationRepository();
