import type { IAuthRepository } from '@/domain/interfaces/auth.interface';
import type { LoginRequest, LoginResponse, ApiResponse } from '@/domain/types';
import { AuthRepository } from '@/infrastructure/api/repositories/auth.repository';
import { AppError } from '@/domain/errors';

/**
 * Servicio de autenticación
 * Contiene la lógica de negocio relacionada con autenticación
 * Depende de la interfaz IAuthRepository (Dependency Inversion)
 */
export class AuthService {
  private authRepository: IAuthRepository;

  constructor(authRepository?: IAuthRepository) {
    this.authRepository = authRepository ?? new AuthRepository();
  }

  /**
   * Procesa el login con validación y transformación de datos
   * El rol se obtiene del backend después de validar las credenciales
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    // Validación básica (validación completa se hace en el componente con Zod)
    if (!credentials.email || !credentials.password) {
      throw AppError.create('MISSING_REQUIRED_FIELD', 'Email y contraseña son requeridos');
    }

    // Llamada al repositorio (los errores de API ya son AppError)
    const response = await this.authRepository.login(credentials);

    // Post-procesamiento si es necesario
    if (response.success && response.data) {
      // Aquí se podría agregar lógica adicional como:
      // - Guardar en cache
      // - Emitir eventos
      // - Transformar datos
    }

    return response;
  }

  /**
   * Verifica usuario para recuperación de contraseña
   */
  async verifyUser(email: string): Promise<ApiResponse<{ email: string }>> {
    if (!email) {
      throw AppError.create('MISSING_REQUIRED_FIELD', 'Email es requerido');
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw AppError.create('INVALID_EMAIL');
    }

    return this.authRepository.verifyUser(email);
  }

  /**
   * Establece nueva contraseña
   */
  async setPassword(userId: string, password: string): Promise<ApiResponse<void>> {
    if (!userId || !password) {
      throw AppError.create('MISSING_REQUIRED_FIELD', 'UserId y password son requeridos');
    }

    if (password.length < 6) {
      throw AppError.create('INVALID_PASSWORD', 'La contraseña debe tener al menos 6 caracteres');
    }

    return this.authRepository.setPassword(userId, password);
  }

  /**
   * Recuperación de contraseña (público, sin autenticación)
   */
  async recoverPassword(userId: string, password: string): Promise<ApiResponse<void>> {
    if (!userId || !password) {
      throw AppError.create('MISSING_REQUIRED_FIELD', 'UserId y password son requeridos');
    }

    return this.authRepository.recoverPassword(userId, password);
  }

  /**
   * Cierra sesión del usuario
   * El backend limpia la cookie HttpOnly automáticamente
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return this.authRepository.logout();
  }
}

// Exportar instancia singleton
export const authService = new AuthService();

