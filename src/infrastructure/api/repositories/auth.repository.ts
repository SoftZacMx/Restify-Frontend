import apiClient from '../client';
import { publicApiClient } from '../public-client';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  ApiResponse,
} from '@/domain/types';

/**
 * Repository para operaciones de autenticación
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Los errores de API se convierten automáticamente a AppError en el interceptor
 */
export class AuthRepository {
  /**
   * Inicia sesión con email y password
   * El rol se obtiene del backend después de validar las credenciales
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    // El interceptor ya convierte cualquier error de axios a AppError.
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  }

  /**
   * Registro público: crea organización + owner + primera sucursal.
   * Endpoint público → usa publicApiClient (sin token). El backend setea la cookie HttpOnly.
   */
  async signup(data: SignupRequest): Promise<ApiResponse<SignupResponse>> {
    const response = await publicApiClient.post('/api/auth/signup', data);
    return response.data;
  }

  /**
   * Verifica el email a partir del token del correo (endpoint público).
   * Idempotente: si ya estaba verificado responde con alreadyVerified=true.
   */
  async verifyEmail(
    token: string
  ): Promise<ApiResponse<{ email: string; alreadyVerified: boolean }>> {
    // El interceptor ya convierte cualquier error de axios a AppError.
    const response = await publicApiClient.post('/api/auth/verify-email', { token });
    return response.data;
  }

  /**
   * Reenvía el correo de verificación (endpoint público, respuesta uniforme anti-enumeración).
   */
  async resendVerification(email: string): Promise<ApiResponse<{ message: string }>> {
    const response = await publicApiClient.post('/api/auth/resend-verification', { email });
    return response.data;
  }

  /**
   * Establece nueva contraseña para un usuario (requiere autenticación)
   */
  async setPassword(userId: string, password: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`/api/auth/set-password/${userId}`, { password });
    return response.data;
  }

  /**
   * Flujo forgot-password (paso 1): pide al backend enviar el correo con el enlace de
   * restablecimiento. Endpoint público → publicApiClient. Respuesta uniforme (anti-enumeración):
   * el backend siempre responde 200 exista o no la cuenta.
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
    const response = await publicApiClient.post('/api/auth/request-password-reset', { email });
    return response.data;
  }

  /**
   * Flujo forgot-password (paso 2): fija la nueva contraseña usando el token del correo.
   * Endpoint público → publicApiClient.
   */
  async resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
    const response = await publicApiClient.post('/api/auth/reset-password', { token, password });
    return response.data;
  }

  /**
   * Cambia la propia contraseña (usuario autenticado). Pensado para el flujo forzado
   * por `mustChangePassword`: guarda la nueva clave y baja el flag en el backend.
   * No pide la contraseña actual (el userId sale del JWT).
   */
  async changeMyPassword(password: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/api/auth/change-my-password', { password });
    return response.data;
  }

  /**
   * Cierra sesión del usuario
   * El backend limpia la cookie HttpOnly automáticamente
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  }

  /**
   * Cambia la sucursal activa: el backend emite un JWT nuevo con esa sucursal.
   */
  async switchBranch(branchId: string): Promise<ApiResponse<{ token: string }>> {
    const response = await apiClient.post('/api/auth/switch-branch', { branchId });
    return response.data;
  }
}

// Exportar instancia singleton
export const authRepository = new AuthRepository();

