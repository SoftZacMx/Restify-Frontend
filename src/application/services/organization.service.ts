import type { ApiResponse } from '@/domain/types';
import type {
  CloseOrganizationResult,
  RequestReactivationRequest,
  ReactivateOrganizationRequest,
  ReactivateOrganizationResult,
} from '@/domain/types/organization.types';
import { OrganizationRepository } from '@/infrastructure/api/repositories/organization.repository';
import { AppError } from '@/domain/errors';

/**
 * Servicio del módulo Organization.
 */
export class OrganizationService {
  private repository: OrganizationRepository;

  constructor(repository?: OrganizationRepository) {
    this.repository = repository ?? new OrganizationRepository();
  }

  /**
   * Cierra (soft-delete) la organización. Requiere el nombre exacto como confirmación.
   */
  async close(confirmationName: string): Promise<ApiResponse<CloseOrganizationResult>> {
    if (!confirmationName) {
      throw AppError.create('MISSING_REQUIRED_FIELD', 'El nombre de confirmación es requerido');
    }
    return this.repository.close(confirmationName);
  }

  /**
   * Paso 1: solicita por correo el enlace de reactivación de la organización.
   */
  async requestReactivation(
    data: RequestReactivationRequest
  ): Promise<ApiResponse<{ message: string }>> {
    if (!data.email) {
      throw AppError.create('MISSING_REQUIRED_FIELD', 'El email es requerido');
    }
    return this.repository.requestReactivation(data);
  }

  /**
   * Paso 2: confirma la reactivación con el token que llegó por correo.
   */
  async reactivate(
    data: ReactivateOrganizationRequest
  ): Promise<ApiResponse<ReactivateOrganizationResult>> {
    if (!data.token) {
      throw AppError.create('MISSING_REQUIRED_FIELD', 'El token es requerido');
    }
    return this.repository.reactivate(data);
  }
}

export const organizationService = new OrganizationService();
