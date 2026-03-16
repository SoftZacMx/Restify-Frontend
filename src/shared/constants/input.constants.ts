/**
 * Longitudes máximas por tipo de input (global).
 * Asignar cada campo de formulario a un tipo y usar su length para maxLength y validación.
 *
 * - simple_input: nombres, apellidos, títulos cortos (ej. usuario, gastos).
 * - extended_input: descripciones cortas, búsquedas.
 * - text_area: descripción, notas, contenido largo.
 */
export const INPUT_LENGTH = {
  simple_input: 100,
  extended_input: 200,
  text_area: 500,
} as const;

export type InputLengthType = keyof typeof INPUT_LENGTH;

/** Helper: obtiene el length de un tipo (para maxLength y validación). */
export function getInputMaxLength(type: InputLengthType): number {
  return INPUT_LENGTH[type];
}
