import { useQuery } from '@tanstack/react-query';
import { publicBranchRepository } from '@/infrastructure/api/repositories/public-branch.repository';

/** Resuelve un slug público al branchId + datos de la sucursal. */
export function usePublicBranch(slug: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-branch', slug],
    queryFn: () => publicBranchRepository.resolveBranch(slug!),
    enabled: !!slug,
    retry: false,
  });

  return {
    branchId: data?.branchId ?? null,
    branchName: data?.name ?? null,
    branch: data ?? null,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
