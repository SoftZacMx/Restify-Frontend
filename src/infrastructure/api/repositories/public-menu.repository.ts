import { publicApiClient } from '../public-client';

export interface PublicMenuItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
}

export interface PublicMenuCategory {
  id: string;
  name: string;
  items: PublicMenuItem[];
}

export interface PublicMenuResponse {
  categories: PublicMenuCategory[];
  extras: PublicMenuItem[];
}

export class PublicMenuRepository {
  async getMenu(branchId: string): Promise<PublicMenuResponse> {
    const response = await publicApiClient.get('/api/public/menu', {
      params: { branchId },
    });
    return response.data.data;
  }
}

export const publicMenuRepository = new PublicMenuRepository();
