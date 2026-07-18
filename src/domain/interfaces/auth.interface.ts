import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  ApiResponse,
} from '../types';

/**
 * Interfaz para el repositorio de autenticación
 * Define el contrato que debe cumplir cualquier implementación
 */
export interface IAuthRepository {
  login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>>;
  signup(data: SignupRequest): Promise<ApiResponse<SignupResponse>>;
  verifyEmail(token: string): Promise<ApiResponse<{ email: string; alreadyVerified: boolean }>>;
  resendVerification(email: string): Promise<ApiResponse<{ message: string }>>;
  setPassword(userId: string, password: string): Promise<ApiResponse<void>>;
  /** Flujo forgot-password (paso 1): solicita el correo con el enlace de restablecimiento. */
  requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>>;
  /** Flujo forgot-password (paso 2): fija la nueva contraseña usando el token del correo. */
  resetPassword(token: string, password: string): Promise<ApiResponse<void>>;
  changeMyPassword(password: string): Promise<ApiResponse<{ message: string }>>;
  logout(): Promise<ApiResponse<{ message: string }>>;
  switchBranch(branchId: string): Promise<ApiResponse<{ token: string }>>;
}

