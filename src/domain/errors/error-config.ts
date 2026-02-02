/**
 * Centralized error configuration for frontend
 * All error codes, messages, and status codes are defined here
 * Mirrors backend error codes for consistency
 */

export const ERROR_CONFIG = {
  // ============================================
  // Authentication & Authorization Errors
  // ============================================
  USER_NOT_FOUND: {
    message: 'Usuario no encontrado',
    statusCode: 404,
    category: 'AUTH',
  },
  USER_NOT_ACTIVE: {
    message: 'Usuario no está activo',
    statusCode: 403,
    category: 'AUTH',
  },
  PASSWORD_INCORRECT: {
    message: 'Contraseña incorrecta',
    statusCode: 401,
    category: 'AUTH',
  },
  INVALID_TOKEN: {
    message: 'Token inválido o expirado',
    statusCode: 401,
    category: 'AUTH',
  },
  UNAUTHORIZED: {
    message: 'Acceso no autorizado',
    statusCode: 401,
    category: 'AUTH',
  },
  FORBIDDEN: {
    message: 'Acceso prohibido',
    statusCode: 403,
    category: 'AUTH',
  },
  TOKEN_EXPIRED: {
    message: 'El token ha expirado',
    statusCode: 401,
    category: 'AUTH',
  },

  // ============================================
  // Validation Errors
  // ============================================
  VALIDATION_ERROR: {
    message: 'Error de validación',
    statusCode: 400,
    category: 'VALIDATION',
  },
  INVALID_EMAIL: {
    message: 'Formato de email inválido',
    statusCode: 400,
    category: 'VALIDATION',
  },
  INVALID_PASSWORD: {
    message: 'Formato de contraseña inválido',
    statusCode: 400,
    category: 'VALIDATION',
  },
  MISSING_REQUIRED_FIELD: {
    message: 'Campo requerido faltante',
    statusCode: 400,
    category: 'VALIDATION',
  },
  INVALID_INPUT: {
    message: 'Datos de entrada inválidos',
    statusCode: 400,
    category: 'VALIDATION',
  },

  // ============================================
  // Business Logic Errors
  // ============================================
  ORDER_NOT_FOUND: {
    message: 'Orden no encontrada',
    statusCode: 404,
    category: 'BUSINESS',
  },
  ORDER_ALREADY_PAID: {
    message: 'Esta orden ya fue pagada',
    statusCode: 400,
    category: 'BUSINESS',
  },
  SPLIT_PAYMENT_ALREADY_EXISTS: {
    message: 'Esta orden ya tiene un pago dividido',
    statusCode: 400,
    category: 'BUSINESS',
  },
  SPLIT_PAYMENT_SAME_METHOD: {
    message: 'Debes elegir dos métodos de pago distintos',
    statusCode: 400,
    category: 'BUSINESS',
  },
  SPLIT_PAYMENT_INVALID_METHOD: {
    message: 'Método de pago no válido para pago dividido',
    statusCode: 400,
    category: 'BUSINESS',
  },
  SPLIT_PAYMENT_AMOUNT_EXCEEDS_TOTAL: {
    message: 'La suma de los dos pagos no puede ser mayor al total de la orden',
    statusCode: 400,
    category: 'BUSINESS',
  },
  SPLIT_PAYMENT_AMOUNT_MISMATCH: {
    message: 'La suma de los dos pagos debe ser igual al total de la orden',
    statusCode: 400,
    category: 'BUSINESS',
  },
  PAYMENT_AMOUNT_MISMATCH: {
    message: 'El monto debe coincidir con el total de la orden',
    statusCode: 400,
    category: 'BUSINESS',
  },
  PRODUCT_NOT_FOUND: {
    message: 'Producto no encontrado',
    statusCode: 404,
    category: 'BUSINESS',
  },
  PRODUCT_CREATION_FAILED: {
    message: 'No se pudo crear el producto',
    statusCode: 400,
    category: 'BUSINESS',
  },
  PRODUCT_FETCH_FAILED: {
    message: 'Error al obtener el producto',
    statusCode: 404,
    category: 'BUSINESS',
  },
  PRODUCT_UPDATE_FAILED: {
    message: 'No se pudo actualizar el producto',
    statusCode: 400,
    category: 'BUSINESS',
  },
  PRODUCT_DELETE_FAILED: {
    message: 'No se pudo eliminar el producto',
    statusCode: 400,
    category: 'BUSINESS',
  },
  PRODUCT_LIST_FAILED: {
    message: 'Error al listar productos',
    statusCode: 400,
    category: 'BUSINESS',
  },
  EXPENSE_NOT_FOUND: {
    message: 'Gasto no encontrado',
    statusCode: 404,
    category: 'BUSINESS',
  },
  SUBTOTAL_MISMATCH: {
    message: 'La suma de subtotales de ítems no coincide con el subtotal del gasto',
    statusCode: 400,
    category: 'BUSINESS',
  },
  IVA_MISMATCH: {
    message: 'El IVA calculado no coincide con el IVA del gasto',
    statusCode: 400,
    category: 'BUSINESS',
  },
  TOTAL_MISMATCH: {
    message: 'La suma de totales de ítems no coincide con el total del gasto',
    statusCode: 400,
    category: 'BUSINESS',
  },
  EXPENSE_CREATION_FAILED: {
    message: 'No se pudo crear el gasto',
    statusCode: 400,
    category: 'BUSINESS',
  },
  EXPENSE_FETCH_FAILED: {
    message: 'Error al obtener el gasto',
    statusCode: 404,
    category: 'BUSINESS',
  },
  EXPENSE_LIST_FAILED: {
    message: 'Error al listar gastos',
    statusCode: 400,
    category: 'BUSINESS',
  },
  EXPENSE_DELETE_FAILED: {
    message: 'No se pudo eliminar el gasto',
    statusCode: 400,
    category: 'BUSINESS',
  },
  TABLE_NOT_FOUND: {
    message: 'Mesa no encontrada',
    statusCode: 404,
    category: 'BUSINESS',
  },
  USER_DELETE_FAILED: {
    message: 'No se pudo desactivar el usuario',
    statusCode: 400,
    category: 'BUSINESS',
  },
  USER_ALREADY_DEACTIVATED: {
    message: 'El usuario ya está desactivado',
    statusCode: 400,
    category: 'BUSINESS',
  },
  USER_ALREADY_ACTIVE: {
    message: 'El usuario ya está activo',
    statusCode: 400,
    category: 'BUSINESS',
  },
  USER_REACTIVATE_FAILED: {
    message: 'No se pudo reactivar el usuario',
    statusCode: 400,
    category: 'BUSINESS',
  },
  USER_HAS_RELATIONS: {
    message: 'No se puede eliminar el usuario porque tiene registros asociados (órdenes, etc.)',
    statusCode: 400,
    category: 'BUSINESS',
  },

  // ============================================
  // Network & Client Errors (Frontend specific)
  // ============================================
  NETWORK_ERROR: {
    message: 'Error de conexión. Verifica tu conexión a internet',
    statusCode: 0,
    category: 'NETWORK',
  },
  TIMEOUT_ERROR: {
    message: 'La solicitud tardó demasiado. Intenta nuevamente',
    statusCode: 408,
    category: 'NETWORK',
  },
  REQUEST_CANCELLED: {
    message: 'La solicitud fue cancelada',
    statusCode: 0,
    category: 'NETWORK',
  },
  UNKNOWN_ERROR: {
    message: 'Error desconocido. Por favor, intenta nuevamente',
    statusCode: 0,
    category: 'SYSTEM',
  },

  // ============================================
  // System Errors
  // ============================================
  INTERNAL_ERROR: {
    message: 'Error interno del servidor',
    statusCode: 500,
    category: 'SYSTEM',
  },
  DATABASE_ERROR: {
    message: 'Error de base de datos',
    statusCode: 500,
    category: 'SYSTEM',
  },
  EXTERNAL_SERVICE_ERROR: {
    message: 'Error en servicio externo',
    statusCode: 502,
    category: 'SYSTEM',
  },
  SERVICE_UNAVAILABLE: {
    message: 'Servicio temporalmente no disponible',
    statusCode: 503,
    category: 'SYSTEM',
  },
} as const;

/**
 * Type for error codes - automatically inferred from ERROR_CONFIG keys
 */
export type ErrorCode = keyof typeof ERROR_CONFIG;

/**
 * Error categories for grouping and monitoring
 */
export type ErrorCategory = 'AUTH' | 'VALIDATION' | 'BUSINESS' | 'NETWORK' | 'SYSTEM';

