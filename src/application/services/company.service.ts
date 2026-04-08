import { companyRepository } from '@/infrastructure/api/repositories/company.repository';
import type { CompanyResponse, UpsertCompanyRequest } from '@/domain/types';
import { AppError } from '@/domain/errors';
import { mergeTicketPrintConfig } from '@/shared/utils/ticket-print-config';

export class CompanyService {
  /**
   * Obtiene la información de la compañía. Retorna null si no existe (404).
   */
  async getCompany(): Promise<CompanyResponse | null> {
    try {
      const response = await companyRepository.getCompany();
      if (!response.success || !response.data) {
        return null;
      }
      const row = response.data;
      return {
        ...row,
        ticketConfig: row.ticketConfig ?? mergeTicketPrintConfig(undefined),
      };
    } catch (error: unknown) {
      if (error instanceof AppError && error.code === 'COMPANY_NOT_FOUND') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Crea o actualiza la información de la compañía (upsert).
   */
  async upsertCompany(data: UpsertCompanyRequest): Promise<CompanyResponse> {
    const response = await companyRepository.upsertCompany(data);
    if (!response.success || !response.data) {
      throw new AppError(
        'VALIDATION_ERROR',
        response.error?.message || 'No se pudo guardar la información de la compañía'
      );
    }
    return response.data;
  }
}

export const companyService = new CompanyService();
