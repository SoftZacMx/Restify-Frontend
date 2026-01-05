/**
 * Centralized error exports
 */

export { AppError } from './app-error';
export { ERROR_CONFIG } from './error-config';

// Export types - using re-export syntax compatible with verbatimModuleSyntax
export type { ErrorCode, ErrorCategory } from './error-config';

