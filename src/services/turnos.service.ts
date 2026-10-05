import type { Turno, TurnoNuevo, TurnoActualizacion } from '../models/turno.model.js';
import { eventBus, TURNO_EVENTS } from '../events/eventBus.js';

/**
 * Servicio en memoria para la gestión de turnos.
 * Encapsula la lógica de negocio y emite eventos ante cada mutación.
 */
class TurnosService {
  private turnos: Turno[] = [];
  private siguienteId = 1;

  cargarInicial(turnos: Turno[]): void {
    this.turnos = [...turnos];
    this.siguienteId = this.turnos.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  }

  listar(): Turno[] {
    return [...this.turnos];
  }

  obtenerPorId(id: number): Turno | undefined {
    return this.turnos.find((t) => t.id === id);
  }

  crear(nuevo: TurnoNuevo): Turno {
    const turno: Turno = { id: this.siguienteId++, ...nuevo };
    this.turnos.push(turno);
    eventBus.emit(TURNO_EVENTS.CREADO, turno);
    return turno;
  }

  actualizar(id: number, cambios: TurnoActualizacion): Turno | null {
    const index = this.turnos.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const actualizado: Turno = { ...this.turnos[index], ...cambios, id };
    this.turnos[index] = actualizado;
    eventBus.emit(TURNO_EVENTS.ACTUALIZADO, actualizado);
    return actualizado;
  }

  eliminar(id: number): boolean {
    const index = this.turnos.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.turnos.splice(index, 1);
    eventBus.emit(TURNO_EVENTS.ELIMINADO, { id });
    return true;
  }
}

export const turnosService = new TurnosService();
