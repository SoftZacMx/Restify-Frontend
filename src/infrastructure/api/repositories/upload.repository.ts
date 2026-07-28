import apiClient from '../client';
import type { ApiResponse } from '@/domain/types';

export interface UploadResult {
  url: string;
  key: string;
}

export type ImageKind = 'branch_logo' | 'org_logo' | 'product_image' | 'menu_item_image';

export class UploadRepository {
  async uploadImage(file: File, kind: ImageKind): Promise<ApiResponse<UploadResult>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);

    const response = await apiClient.post('/api/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
}

export const uploadRepository = new UploadRepository();
