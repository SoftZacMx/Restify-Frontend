import { publicApiClient } from '../public-client';

export interface PublicBranchResponse {
  branchId: string;
  name: string;
  organizationName: string;
  logoUrl: string | null;
  timezone: string;
  currency: string;
}

export class PublicBranchRepository {
  /** Resuelve un slug público al branchId + datos de la sucursal. */
  async resolveBranch(slug: string): Promise<PublicBranchResponse> {
    const response = await publicApiClient.get(`/api/public/branch/${slug}`);
    return response.data.data;
  }
}

export const publicBranchRepository = new PublicBranchRepository();
