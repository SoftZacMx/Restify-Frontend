/**
 * Tipos para el módulo de configuración de la compañía
 */

export interface CompanyResponse {
  id: string;
  name: string;
  state: string;
  city: string;
  street: string;
  exteriorNumber: string;
  phone: string;
  rfc: string | null;
  logoUrl: string | null;
  startOperations: string | null;
  endOperations: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertCompanyRequest {
  name: string;
  state: string;
  city: string;
  street: string;
  exteriorNumber: string;
  phone: string;
  rfc?: string | null;
  logoUrl?: string | null;
  startOperations?: string | null;
  endOperations?: string | null;
}
