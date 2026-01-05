import type { LoginRequest, LoginResponse, ApiResponse } from '../types';

/**
 * Interfaz para el repositorio de autenticación
 * Define el contrato que debe cumplir cualquier implementación
 */
export interface IAuthRepository {
  login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>>;
  verifyUser(email: string): Promise<ApiResponse<{ email: string }>>;
  setPassword(userId: string, password: string): Promise<ApiResponse<void>>;
  logout(): Promise<ApiResponse<{ message: string }>>;
}

