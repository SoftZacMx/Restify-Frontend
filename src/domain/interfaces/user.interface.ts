import type { User, CreateUserRequest, UpdateUserRequest, ApiResponse } from '../types';

/**
 * Interface para el repositorio de usuarios
 * Define el contrato que debe cumplir cualquier implementación
 * Cumple ISP: Interface Segregation Principle
 */
export interface IUserRepository {
  createUser(userData: CreateUserRequest): Promise<ApiResponse<User>>;
  getUserById(userId: string): Promise<ApiResponse<User>>;
  listUsers(filters?: {
    search?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<User[]>>;
  updateUser(userId: string, userData: UpdateUserRequest): Promise<ApiResponse<User>>;
  deleteUser(userId: string): Promise<ApiResponse<void>>;
  reactivateUser(userId: string): Promise<ApiResponse<void>>;
}

/**
 * Interface para el servicio de usuarios
 * Define el contrato para la lógica de negocio de usuarios
 * Cumple ISP: Interface Segregation Principle
 */
export interface IUserService {
  createUser(userData: CreateUserRequest): Promise<User>;
  getUserById(userId: string): Promise<User>;
  listUsers(filters?: {
    search?: string;
    role?: string;
    status?: string;
  }): Promise<User[]>;
  updateUser(userId: string, userData: UpdateUserRequest): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  reactivateUser(userId: string): Promise<void>;
}

