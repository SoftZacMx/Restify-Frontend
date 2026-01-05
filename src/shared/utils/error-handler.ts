import type { AxiosError } from 'axios';
import { AppError, ERROR_CONFIG } from '@/domain/errors';
import type { ErrorCode } from '@/domain/errors';

/**
 * Converts Axios errors to AppError instances
 * Handles API responses with error codes from backend
 */
export function handleApiError(error: unknown): AppError {
  // If it's already an AppError, return it
  if (error instanceof AppError) {
    return error;
  }

  // Handle Axios errors
  if (isAxiosError(error)) {
    return convertAxiosErrorToAppError(error);
  }

  // Handle generic Error objects
  if (error instanceof Error) {
    return convertErrorToAppError(error);
  }

  // Handle string errors
  if (typeof error === 'string') {
    return AppError.create('UNKNOWN_ERROR', error);
  }

  // Unknown error type
  return AppError.create('UNKNOWN_ERROR', 'Error desconocido');
}

/**
 * Type guard for AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/**
 * Converts AxiosError to AppError
 */
function convertAxiosErrorToAppError(axiosError: AxiosError): AppError {
  // Network error (no response from server)
  if (!axiosError.response) {
    if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
      return AppError.create('TIMEOUT_ERROR');
    }
    if (axiosError.code === 'ERR_CANCELED') {
      return AppError.create('REQUEST_CANCELLED');
    }
    return AppError.create('NETWORK_ERROR');
  }

  const { status, data } = axiosError.response;

  // Try to extract error code from backend response
  // Backend returns: { success: false, error: { code: 'USER_NOT_FOUND', message: '...' } }
  const errorData = data as any;
  
  // Get error message from various possible locations
  const errorMessage = 
    errorData?.error?.message || 
    errorData?.message || 
    errorData?.error || 
    String(data) || 
    '';

  // Check for foreign key constraint errors FIRST (before checking error codes)
  // Prisma errors often contain the full stack trace, so we check the entire message
  // Also check the raw response data as a string in case the error is nested
  // NOTE: With soft delete implemented, these errors should rarely occur, but we keep this check for backwards compatibility
  const fullErrorText = JSON.stringify(data).toLowerCase();
  const lowerMessage = errorMessage.toLowerCase();
  
  if (
    lowerMessage.includes('foreign key') ||
    lowerMessage.includes('constraint') ||
    lowerMessage.includes('violated') ||
    lowerMessage.includes('prisma.user.delete') ||
    lowerMessage.includes('userid') ||
    lowerMessage.includes('p2003') || // Prisma error code for foreign key constraint
    (lowerMessage.includes('cannot delete') && lowerMessage.includes('user')) ||
    fullErrorText.includes('foreign key') ||
    fullErrorText.includes('constraint violated') ||
    fullErrorText.includes('p2003')
  ) {
    return AppError.create(
      'USER_HAS_RELATIONS',
      'No se puede eliminar el usuario porque tiene registros asociados (órdenes, pagos, etc.). Primero debes eliminar o transferir estos registros.'
    );
  }

  // Check for error code from backend
  if (errorData?.error?.code) {
    const backendCode = errorData.error.code as string;
    const backendMessage = errorData.error.message || errorData.error;

    // Validate that the code exists in our ERROR_CONFIG
    if (isValidErrorCode(backendCode)) {
      return AppError.create(
        backendCode as ErrorCode,
        backendMessage,
        errorData.error.metadata
      );
    }
  }

  // Map HTTP status codes to error codes
  return mapStatusCodeToErrorCode(status, axiosError.message);
}

/**
 * Converts generic Error to AppError
 */
function convertErrorToAppError(error: Error): AppError {
  const message = error.message.toLowerCase();

  // Try to map common error messages to error codes
  if (message.includes('network') || message.includes('connection')) {
    return AppError.create('NETWORK_ERROR', error.message);
  }
  if (message.includes('timeout')) {
    return AppError.create('TIMEOUT_ERROR', error.message);
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return AppError.create('VALIDATION_ERROR', error.message);
  }

  return AppError.create('UNKNOWN_ERROR', error.message);
}

/**
 * Maps HTTP status codes to ErrorCode
 */
function mapStatusCodeToErrorCode(status: number, message?: string): AppError {
  switch (status) {
    case 400:
      return AppError.create('VALIDATION_ERROR', message);
    case 401:
      return AppError.create('UNAUTHORIZED', message);
    case 403:
      return AppError.create('FORBIDDEN', message);
    case 404:
      return AppError.create('USER_NOT_FOUND', message);
    case 408:
      return AppError.create('TIMEOUT_ERROR', message);
    case 500:
      return AppError.create('INTERNAL_ERROR', message);
    case 502:
      return AppError.create('EXTERNAL_SERVICE_ERROR', message);
    case 503:
      return AppError.create('SERVICE_UNAVAILABLE', message);
    default:
      return AppError.create('UNKNOWN_ERROR', message || `Error HTTP ${status}`);
  }
}

/**
 * Validates if a string is a valid ErrorCode
 */
function isValidErrorCode(code: string): code is ErrorCode {
  return code in ERROR_CONFIG;
}

