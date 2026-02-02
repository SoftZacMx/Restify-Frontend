import React from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
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
import type { ProductTableItem } from '@/domain/types';
import { cn } from '@/shared/lib/utils';

interface ProductTableProps {
  products: ProductTableItem[];
  isLoading?: boolean;
  onProductAction?: (productId: string, action: 'view' | 'edit' | 'delete' | 'toggle-status') => void;
}

/**
 * Componente ProductTable
 * Responsabilidad única: Renderizar tabla de productos
 * Cumple SRP: Solo maneja la presentación de datos en tabla
 */
export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading = false,
  onProductAction,
}) => {
  if (isLoading) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Cargando productos...
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No se encontraron productos
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
                  Nombre
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Descripción
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Estado
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Fecha de registro
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
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/products/${product.id}`}
                      className="text-slate-900 dark:text-white hover:text-primary transition-colors"
                    >
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-md">
                    <div className="truncate" title={product.description || ''}>
                      {product.description || 'Sin descripción'}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
                        product.statusLabel === 'Activo'
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
                      )}
                    >
                      {product.statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {new Date(product.registrationDate).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {new Date(product.createdAt).toLocaleDateString('es-ES', {
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
                          onSelect={() => onProductAction?.(product.id, 'view')}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Ver detalle</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onProductAction?.(product.id, 'edit')}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onProductAction?.(product.id, 'delete')}
                          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onProductAction?.(product.id, 'toggle-status')}
                          className="cursor-pointer"
                        >
                          <span>
                            {product.status ? 'Desactivar' : 'Activar'}
                          </span>
                        </DropdownMenuItem>
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
