/**
 * Calcula la fortaleza de una contraseña
 * Retorna: 'weak' | 'medium' | 'strong'
 */
export const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (!password || password.length === 0) {
    return 'weak';
  }

  let strength = 0;

  // Longitud
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;

  // Diferentes tipos de caracteres
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

/**
 * Obtiene el porcentaje de fortaleza de contraseña (0-100)
 */
export const getPasswordStrengthPercentage = (password: string): number => {
  const strength = calculatePasswordStrength(password);
  switch (strength) {
    case 'weak':
      return 33;
    case 'medium':
      return 66;
    case 'strong':
      return 100;
    default:
      return 0;
  }
};

/**
 * Obtiene la etiqueta de fortaleza en español
 */
export const getPasswordStrengthLabel = (password: string): string => {
  const strength = calculatePasswordStrength(password);
  switch (strength) {
    case 'weak':
      return 'Débil';
    case 'medium':
      return 'Media';
    case 'strong':
      return 'Fuerte';
    default:
      return 'Débil';
  }
};

/**
 * Obtiene el color de la barra de fortaleza
 */
export const getPasswordStrengthColor = (password: string): string => {
  const strength = calculatePasswordStrength(password);
  switch (strength) {
    case 'weak':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'strong':
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
};

/**
 * Obtiene el color del texto de fortaleza
 */
export const getPasswordStrengthTextColor = (password: string): string => {
  const strength = calculatePasswordStrength(password);
  switch (strength) {
    case 'weak':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'strong':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

