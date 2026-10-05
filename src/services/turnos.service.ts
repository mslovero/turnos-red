import type { Turno, TurnoNuevo, TurnoActualizacion } from '../models/turno.model.js';
import type { FiltroTurnos } from '../schemas/turno.schema.js';
import { eventBus, TURNO_EVENTS } from '../events/eventBus.js';

/**
 * Convierte una fecha "dd/mm/yyyy" a "YYYY-MM-DD" para comparar con las fechas almacenadas.
 */
const normalizarFechaFiltro = (fecha: string): string => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(fecha);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  }
  return fecha;
};

class TurnosService {
  private turnos: Turno[] = [];
  private siguienteId = 1;

  cargarInicial(turnos: Turno[]): void {
    this.turnos = [...turnos];
    this.siguienteId = this.turnos.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  }

  listar(filtros: FiltroTurnos = {}): Turno[] {
    const fechaFiltro = filtros.fecha ? normalizarFechaFiltro(filtros.fecha) : undefined;
    return this.turnos.filter((t) => {
      if (filtros.especialidad && t.especialidad !== filtros.especialidad.toLowerCase()) {
        return false;
      }
      if (fechaFiltro && t.fecha !== fechaFiltro) return false;
      if (filtros.medicoId && (t as Turno & { medicoId?: number }).medicoId !== filtros.medicoId) {
        return false;
      }
      return true;
    });
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
    const idx = this.turnos.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const actualizado: Turno = { ...this.turnos[idx], ...cambios, id };
    this.turnos[idx] = actualizado;
    eventBus.emit(TURNO_EVENTS.ACTUALIZADO, actualizado);
    return actualizado;
  }

  eliminar(id: number): boolean {
    const idx = this.turnos.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.turnos.splice(idx, 1);
    eventBus.emit(TURNO_EVENTS.ELIMINADO, { id });
    return true;
  }
}

export const turnosService = new TurnosService();
