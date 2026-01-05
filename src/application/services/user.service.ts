import { UserRepository } from '@/infrastructure/api/repositories/user.repository';
import type { IUserService } from '@/domain/interfaces/user.interface';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from '@/domain/types';
import { AppError } from '@/domain/errors';

/**
 * Servicio de usuarios
 * Contiene la lógica de negocio para operaciones de usuarios
 * Cumple SRP: Solo maneja lógica de negocio de usuarios
 * Cumple DIP: Depende de la abstracción IUserRepository
 */
export class UserService implements IUserService {
  private userRepository: UserRepository;

  constructor(userRepository?: UserRepository) {
    this.userRepository = userRepository ?? new UserRepository();
  }

  /**
   * Crea un nuevo usuario
   * Valida los datos antes de enviarlos al repositorio
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    // Validaciones de negocio
    this.validateCreateUserData(userData);

    try {
      const response = await this.userRepository.createUser(userData);
      if (!response.success || !response.data) {
        throw new AppError('USER_CREATION_FAILED', 'No se pudo crear el usuario');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('USER_CREATION_FAILED', 'Error al crear el usuario');
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUserById(userId: string): Promise<User> {
    if (!userId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del usuario es requerido');
    }

    try {
      const response = await this.userRepository.getUserById(userId);
      if (!response.success || !response.data) {
        throw new AppError('USER_NOT_FOUND', 'Usuario no encontrado');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('USER_FETCH_FAILED', 'Error al obtener el usuario');
    }
  }

  /**
   * Lista usuarios con filtros opcionales
   */
  async listUsers(filters?: {
    search?: string;
    role?: string;
    status?: string;
  }): Promise<User[]> {
    try {
      const response = await this.userRepository.listUsers(filters);
      if (!response.success || !response.data) {
        return [];
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('USER_LIST_FAILED', 'Error al listar usuarios');
    }
  }

  /**
   * Actualiza un usuario existente
   */
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    if (!userId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del usuario es requerido');
    }

    try {
      const response = await this.userRepository.updateUser(userId, userData);
      if (!response.success || !response.data) {
        throw new AppError('USER_UPDATE_FAILED', 'No se pudo actualizar el usuario');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('USER_UPDATE_FAILED', 'Error al actualizar el usuario');
    }
  }

  /**
   * Elimina un usuario
   */
  async deleteUser(userId: string): Promise<void> {
    if (!userId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del usuario es requerido');
    }

    try {
      const response = await this.userRepository.deleteUser(userId);
      if (!response.success) {
        throw new AppError('USER_DELETE_FAILED', 'No se pudo eliminar el usuario');
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('USER_DELETE_FAILED', 'Error al eliminar el usuario');
    }
  }

  /**
   * Reactiva un usuario desactivado
   */
  async reactivateUser(userId: string): Promise<void> {
    if (!userId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del usuario es requerido');
    }

    try {
      const response = await this.userRepository.reactivateUser(userId);
      if (!response.success) {
        throw new AppError('USER_REACTIVATE_FAILED', 'No se pudo reactivar el usuario');
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('USER_REACTIVATE_FAILED', 'Error al reactivar el usuario');
    }
  }

  /**
   * Valida los datos para crear un usuario
   */
  private validateCreateUserData(userData: CreateUserRequest): void {
    if (!userData.name || userData.name.trim().length === 0) {
      throw new AppError('VALIDATION_ERROR', 'El nombre es requerido');
    }

    if (!userData.last_name || userData.last_name.trim().length === 0) {
      throw new AppError('VALIDATION_ERROR', 'El apellido es requerido');
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      throw new AppError('VALIDATION_ERROR', 'El email no es válido');
    }

    if (!userData.password || userData.password.length < 8) {
      throw new AppError('VALIDATION_ERROR', 'La contraseña debe tener al menos 8 caracteres');
    }

    if (!userData.rol) {
      throw new AppError('VALIDATION_ERROR', 'El rol es requerido');
    }
  }

  /**
   * Valida formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

