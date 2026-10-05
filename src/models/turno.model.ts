/**
 * Representa un registro CRUDO tal como llega desde los JSON de las sedes.
 * Los tipos son laxos porque cada sede envía los datos con formato inconsistente
 * (strings con espacios, mayúsculas/minúsculas mezcladas, fechas con distintos separadores, etc.).
 */
export interface TurnoCrudo {
  id: string | number;
  paciente: string;
  documento: string | number;
  especialidad: string;
  fecha: string;
  hora: string;
  confirmado: string | boolean;
  observaciones?: string;
}

/**
 * Representa un turno YA NORMALIZADO del dominio de la aplicación.
 * Todos los campos están validados y tipados estrictamente.
 */
export interface Turno {
  id: number;
  paciente: string;
  documento: string;
  especialidad: Especialidad;
  fecha: string; // formato ISO YYYY-MM-DD
  hora: string; // formato HH:MM (24 h)
  confirmado: boolean;
  observaciones?: string;
}

/**
 * Especialidades médicas soportadas por la red de centros.
 */
export type Especialidad = 'clinica medica' | 'pediatria' | 'odontologia' | 'nutricion';

/**
 * DTO para crear un turno desde el endpoint POST /turnos.
 */
export type TurnoNuevo = Omit<Turno, 'id'>;

/**
 * DTO para actualizar un turno (todos los campos opcionales excepto el id).
 */
export type TurnoActualizacion = Partial<Omit<Turno, 'id'>>;
