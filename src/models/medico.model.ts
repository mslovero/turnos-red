import type { Especialidad } from './turno.model.js';

export interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  matricula: string;
  documento: string;
  especialidad: Especialidad | string;
  disponible: boolean;
  email?: string;
}
