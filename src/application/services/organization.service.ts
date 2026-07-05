import type { ApiResponse } from '@/domain/types';
import type {
  CloseOrganizationResult,
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
   * Reactiva una organización cerrada con las credenciales del owner.
   */
  async reactivate(
    data: ReactivateOrganizationRequest
  ): Promise<ApiResponse<ReactivateOrganizationResult>> {
    if (!data.email || !data.password) {
      throw AppError.create('MISSING_REQUIRED_FIELD', 'Email y contraseña son requeridos');
    }
    return this.repository.reactivate(data);
  }
}

export const organizationService = new OrganizationService();
