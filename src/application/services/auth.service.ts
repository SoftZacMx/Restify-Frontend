import type { IAuthRepository } from '@/domain/interfaces/auth.interface';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  ApiResponse,
} from '@/domain/types';
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
   * Registro público: crea organización + owner + primera sucursal (una sola request).
   * El backend setea la cookie HttpOnly y devuelve token + user.
   */
  async signup(data: SignupRequest): Promise<ApiResponse<SignupResponse>> {
    if (!data.user?.email || !data.user?.password) {
      throw AppError.create('MISSING_REQUIRED_FIELD', 'Email y contraseña son requeridos');
    }

    return this.authRepository.signup(data);
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
   * Verifica el email con el token recibido en el correo.
   */
  async verifyEmail(
    token: string
  ): Promise<ApiResponse<{ email: string; alreadyVerified: boolean }>> {
    if (!token) {
      throw AppError.create('MISSING_REQUIRED_FIELD', 'El token de verificación es requerido');
    }
    return this.authRepository.verifyEmail(token);
  }

  /**
   * Reenvía el correo de verificación al email indicado.
   */
  async resendVerification(email: string): Promise<ApiResponse<{ message: string }>> {
    if (!email) {
      throw AppError.create('MISSING_REQUIRED_FIELD', 'Email es requerido');
    }
    return this.authRepository.resendVerification(email);
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
   * Cambia la propia contraseña (usuario autenticado). Flujo forzado por mustChangePassword:
   * el usuario ya inició sesión y define su nueva clave; el backend baja el flag.
   */
  async changeMyPassword(password: string): Promise<ApiResponse<{ message: string }>> {
    if (!password) {
      throw AppError.create('MISSING_REQUIRED_FIELD', 'La contraseña es requerida');
    }
    return this.authRepository.changeMyPassword(password);
  }

  /**
   * Cierra sesión del usuario
   * El backend limpia la cookie HttpOnly automáticamente
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return this.authRepository.logout();
  }

  /**
   * Cambia la sucursal activa y devuelve el nuevo token.
   * Los errores del backend (BRANCH_FORBIDDEN, BRANCH_DISABLED) llegan como AppError.
   */
  async switchBranch(branchId: string): Promise<string> {
    if (!branchId) {
      throw AppError.create('MISSING_REQUIRED_FIELD', 'La sucursal es requerida');
    }
    const response = await this.authRepository.switchBranch(branchId);
    if (!response.success || !response.data) {
      throw AppError.create('UNKNOWN_ERROR', 'No se pudo cambiar de sucursal');
    }
    return response.data.token;
  }
}

// Exportar instancia singleton
export const authService = new AuthService();

