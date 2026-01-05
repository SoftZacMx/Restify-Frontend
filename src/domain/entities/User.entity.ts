import type { User, UserRole } from '../types';

/**
 * Entidad User
 * Representa un usuario en el dominio de la aplicación
 */
export class UserEntity {
  readonly id: string;
  readonly name: string;
  readonly last_name: string;
  readonly second_last_name: string | null;
  readonly email: string;
  readonly phone: string | null;
  readonly status: boolean;
  readonly rol: UserRole;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(
    id: string,
    name: string,
    last_name: string,
    second_last_name: string | null,
    email: string,
    phone: string | null,
    status: boolean,
    rol: UserRole,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.name = name;
    this.last_name = last_name;
    this.second_last_name = second_last_name;
    this.email = email;
    this.phone = phone;
    this.status = status;
    this.rol = rol;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Crea una instancia de UserEntity desde datos planos
   */
  static fromData(data: User): UserEntity {
    return new UserEntity(
      data.id,
      data.name,
      data.last_name,
      data.second_last_name,
      data.email,
      data.phone,
      data.status,
      data.rol,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  getFullName(): string {
    const parts = [this.name, this.last_name];
    if (this.second_last_name) {
      parts.push(this.second_last_name);
    }
    return parts.join(' ');
  }

  /**
   * Verifica si el usuario está activo
   */
  isActive(): boolean {
    return this.status === true;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    return this.rol === role;
  }
}

