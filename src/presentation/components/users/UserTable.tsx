import React from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Edit, Trash2, RotateCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import type { UserTableItem } from '@/domain/types';
import { cn } from '@/shared/lib/utils';

interface UserTableProps {
  users: UserTableItem[];
  isLoading?: boolean;
  onUserAction?: (userId: string, action: 'edit' | 'delete' | 'reactivate' | 'toggle-status') => void;
}

/**
 * Componente UserTable
 * Responsabilidad única: Renderizar tabla de usuarios
 * Cumple SRP: Solo maneja la presentación de datos en tabla
 */
export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading = false,
  onUserAction,
}) => {
  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' => {
    const roleVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
      Administrador: 'secondary',
      Gerente: 'default',
      Mesero: 'default',
      Cocinero: 'outline',
    };
    return roleVariants[role] || 'default';
  };

  const getRoleBadgeColor = (role: string): string => {
    const colors: Record<string, string> = {
      Administrador: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
      Gerente: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
      Mesero: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
      Cocinero: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300',
    };
    return colors[role] || '';
  };

  if (isLoading) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Cargando usuarios...
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No se encontraron usuarios
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Nombre completo
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Email
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Rol
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Estado
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Fecha de creación
                </TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/users/${user.id}`}
                      className="text-slate-900 dark:text-white hover:text-primary transition-colors"
                    >
                    {user.fullName}
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
                        getRoleBadgeColor(user.roleLabel)
                      )}
                    >
                      {user.roleLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
                        user.statusLabel === 'Activo'
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
                      )}
                    >
                      {user.statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onSelect={() => onUserAction?.(user.id, 'edit')}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        {user.statusLabel === 'Activo' ? (
                        <DropdownMenuItem
                          onSelect={() => onUserAction?.(user.id, 'delete')}
                          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                            <span>Desactivar</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onSelect={() => onUserAction?.(user.id, 'reactivate')}
                            className="cursor-pointer text-green-600 dark:text-green-400 focus:text-green-600 dark:focus:text-green-400 focus:bg-green-50 dark:focus:bg-green-900/20"
                          >
                            <RotateCw className="mr-2 h-4 w-4" />
                            <span>Reactivar</span>
                        </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

