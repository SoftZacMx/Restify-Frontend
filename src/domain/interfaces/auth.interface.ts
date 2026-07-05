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
  verifyUser(email: string): Promise<ApiResponse<{ email: string }>>;
  verifyEmail(token: string): Promise<ApiResponse<{ email: string; alreadyVerified: boolean }>>;
  resendVerification(email: string): Promise<ApiResponse<{ message: string }>>;
  setPassword(userId: string, password: string): Promise<ApiResponse<void>>;
  recoverPassword(userId: string, password: string): Promise<ApiResponse<void>>;
  changeMyPassword(password: string): Promise<ApiResponse<{ message: string }>>;
  logout(): Promise<ApiResponse<{ message: string }>>;
  switchBranch(branchId: string): Promise<ApiResponse<{ token: string }>>;
}

