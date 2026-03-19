import apiClient from '../client';
import type {
  ApiResponse,
  TableResponse,
  CreateTableRequest,
  UpdateTableRequest,
  ListTablesRequest,
} from '@/domain/types';

export class TableRepository {
  async createTable(data: CreateTableRequest): Promise<ApiResponse<TableResponse>> {
    const response = await apiClient.post('/api/tables', data);
    return response.data;
  }

  async getTableById(id: string): Promise<ApiResponse<TableResponse>> {
    const response = await apiClient.get(`/api/tables/${id}`);
    return response.data;
  }

  async listTables(filters?: ListTablesRequest): Promise<ApiResponse<TableResponse[]>> {
    const params: Record<string, string> = {};
    
    if (filters?.status !== undefined) {
      params.status = String(filters.status);
    }
    if (filters?.availabilityStatus !== undefined) {
      params.availabilityStatus = String(filters.availabilityStatus);
    }
    if (filters?.userId) {
      params.userId = filters.userId;
    }
    if (filters?.name !== undefined) {
      params.name = filters.name;
    }
    
    const response = await apiClient.get('/api/tables', { params });
    return response.data;
  }

  async updateTable(id: string, data: UpdateTableRequest): Promise<ApiResponse<TableResponse>> {
    const response = await apiClient.put(`/api/tables/${id}`, data);
    return response.data;
  }

  async deleteTable(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/tables/${id}`);
    return response.data;
  }
}

export const tableRepository = new TableRepository();
