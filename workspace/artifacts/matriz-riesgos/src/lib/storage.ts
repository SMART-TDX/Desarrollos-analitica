// src/lib/storage.ts
import { INITIAL_DATA } from "./initialData";

export interface Parámetro {
  id: number;
  categoria: "PROCESO" | "SUBPROCESO" | "FACTOR_RIESGO" | "TIPO_RIESGO";
  nombre: string;
}

export interface Riesgo {
  id: number;
  codigo: string;
  proceso: string;
  subproceso?: string;
  factorRiesgo?: string;
  descripcion: string;
  pi: number; // Probabilidad Inherente
  ii: number; // Impacto Inherente
  perfilInherente: string;
  efectividad?: string;
  pr?: number; // Probabilidad Residual
  ir?: number; // Impacto Residual
}

// Obtener cualquier conjunto de datos guardados o por defecto
export function getStoredData<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(`laft_${key}`);
  if (!data) {
    localStorage.setItem(`laft_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
}

// Guardar datos
export function saveStoredData<T>(key: string, value: T): void {
  localStorage.setItem(`laft_${key}`, JSON.stringify(value));
}