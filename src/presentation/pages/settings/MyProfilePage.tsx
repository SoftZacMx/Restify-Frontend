import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/presentation/components/ui/card';
import { ProfileForm } from '@/presentation/components/settings/ProfileForm';
import { UserService } from '@/application/services/user.service';
import { useAuthStore } from '@/presentation/store/auth.store';
import type { UpdateUserRequest } from '@/domain/types';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

/**
 * Página "Mi perfil": autogestión de los datos propios (nombre, email,
 * teléfono, contraseña). A diferencia de /users, acá nunca se toca rol ni
 * estado de la cuenta — eso es gestión de usuarios, no autogestión.
 *
 * Es el único lugar donde el OWNER puede editar sus propios datos: el módulo
 * de Usuarios excluye su cuenta por completo (debe existir un único owner,
 * y su rol/estado no se gestionan desde ahí).
 */
const userService = new UserService();

const MyProfilePage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const handleSubmit = async (data: UpdateUserRequest) => {
    setIsSaving(true);
    try {
      const updated = await userService.updateUser(user.id, data);
      // El endpoint de update no devuelve organizationId/organizationName (son del
      // contexto de sesión, no del usuario); se preservan del usuario actual del store.
      setUser({ ...user, ...updated });
      showSuccessToast('Perfil actualizado', 'Tus datos se guardaron correctamente');
    } catch (error) {
      const message = error instanceof AppError ? error.message : 'No se pudo actualizar tu perfil';
      showErrorToast('Error al guardar', message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mi perfil</CardTitle>
          <CardDescription>
            Edita tus datos personales y tu contraseña. El rol y el estado de tu cuenta se
            gestionan por separado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} onSubmit={handleSubmit} isLoading={isSaving} />
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProfilePage;
