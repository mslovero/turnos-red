import { EventEmitter } from 'node:events';
import type { Turno } from '../models/turno.model.js';

/**
 * Nombres de eventos del dominio. Usar constantes evita typos.
 */
export const TURNO_EVENTS = {
  CREADO: 'turno:creado',
  ACTUALIZADO: 'turno:actualizado',
  ELIMINADO: 'turno:eliminado',
} as const;

/**
 * Payloads tipados por evento (type-safe).
 */
export interface TurnoEventMap {
  'turno:creado': Turno;
  'turno:actualizado': Turno;
  'turno:eliminado': { id: number };
}

/**
 * EventEmitter tipado para desacoplar operaciones de datos de los consumidores
 * (Socket.IO, logs, auditoría, etc.).
 */
class TypedEventBus extends EventEmitter {
  emit<K extends keyof TurnoEventMap>(evento: K, payload: TurnoEventMap[K]): boolean {
    return super.emit(evento, payload);
  }

  on<K extends keyof TurnoEventMap>(
    evento: K,
    listener: (payload: TurnoEventMap[K]) => void,
  ): this {
    return super.on(evento, listener);
  }
}

export const eventBus = new TypedEventBus();
