import apiClient from '../client';
import type { ApiResponse, CompanyResponse, UpsertCompanyRequest } from '@/domain/types';

export class CompanyRepository {
  async getCompany(): Promise<ApiResponse<CompanyResponse>> {
    const response = await apiClient.get('/api/company');
    const result = response.data;
    return result;
  }

  async upsertCompany(data: UpsertCompanyRequest): Promise<ApiResponse<CompanyResponse>> {
    const response = await apiClient.put('/api/company', data);
    return response.data;
  }
}

export const companyRepository = new CompanyRepository();
