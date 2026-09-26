import React from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Eye, Trash2, RotateCw, KeyRound } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { Badge } from '@/presentation/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import type { UserTableItem } from '@/domain/types';
import { cn } from '@/shared/lib/utils';
import { APP_TIMEZONE } from '@/shared/constants';

interface UserTableProps {
  users: UserTableItem[];
  isLoading?: boolean;
  /** Si true, muestra "Resetear contraseña" en el menú. Solo OWNER/ADMIN. */
  canResetPassword?: boolean;
  onUserAction?: (
    userId: string,
    action: 'view' | 'delete' | 'reactivate' | 'toggle-status' | 'reset-password'
  ) => void;
}

/**
 * Componente UserTable
 * Responsabilidad única: Renderizar tabla de usuarios
 * Cumple SRP: Solo maneja la presentación de datos en tabla
 */
export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading = false,
  canResetPassword = false,
  onUserAction,
}) => {
  const getRoleBadgeColor = (role: string): string => {
    const colors: Record<string, string> = {
      Propietario: 'bg-fresco-suave text-fresco-texto',
      Administrador: 'bg-chart-5/15 text-chart-5',
      Gerente: 'bg-primary/10 dark:bg-primary/20 text-primary',
      Empleado: 'bg-primary/10 dark:bg-primary/20 text-primary',
      Operario: 'bg-apoyo-suave text-apoyo-texto',
    };
    return colors[role] || '';
  };

  if (isLoading) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-8 text-center text-muted-foreground">
            Cargando usuarios...
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-8 text-center text-muted-foreground">
            No se encontraron usuarios
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Nombre completo
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Rol
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fecha de creación
                </TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-muted dark:hover:bg-card/50 transition-colors"
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/users/${user.id}`}
                      className="text-foreground hover:text-primary transition-colors"
                    >
                    {user.fullName}
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
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
                          ? 'bg-fresco-suave text-fresco-texto'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      {user.statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      timeZone: APP_TIMEZONE,
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="p-2 rounded-full text-muted-foreground hover:bg-secondary dark:hover:bg-card hover:text-foreground dark:hover:text-foreground transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onSelect={() => onUserAction?.(user.id, 'view')}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Ver detalle</span>
                        </DropdownMenuItem>
                        {canResetPassword && user.statusLabel === 'Activo' && (
                          <DropdownMenuItem
                            onSelect={() => onUserAction?.(user.id, 'reset-password')}
                            className="cursor-pointer"
                          >
                            <KeyRound className="mr-2 h-4 w-4" />
                            <span>Resetear contraseña</span>
                          </DropdownMenuItem>
                        )}
                        {user.statusLabel === 'Activo' ? (
                        <DropdownMenuItem
                          onSelect={() => onUserAction?.(user.id, 'delete')}
                          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive-suave"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                            <span>Desactivar</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onSelect={() => onUserAction?.(user.id, 'reactivate')}
                            className="cursor-pointer text-fresco focus:text-fresco focus:bg-fresco-suave"
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

