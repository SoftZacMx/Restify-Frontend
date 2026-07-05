import React from 'react';
import type { AccessibleBranch } from '@/domain/types';
import { BranchSelectItem } from './BranchSelectItem';

interface BranchSelectListProps {
  branches: AccessibleBranch[];
  selectedId: string | null;
  onSelect: (branchId: string) => void;
  disabled?: boolean;
}

/** Lista de sucursales seleccionables; delega cada fila a BranchSelectItem. */
export const BranchSelectList: React.FC<BranchSelectListProps> = ({
  branches,
  selectedId,
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {branches.map((branch) => (
        <BranchSelectItem
          key={branch.id}
          branch={branch}
          selected={branch.id === selectedId}
          onSelect={onSelect}
          disabled={disabled}
        />
      ))}
    </div>
  );
};
