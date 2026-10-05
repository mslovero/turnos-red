import type { Request, Response, NextFunction } from 'express';
import { turnosService } from '../services/turnos.service.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  crearTurnoSchema,
  actualizarTurnoSchema,
  filtroTurnosSchema,
} from '../schemas/turno.schema.js';
import type { Turno } from '../models/turno.model.js';

/**
 * Convierte el input validado por Zod (especialidad en PascalCase)
 * al dominio interno (especialidad en minúsculas sin tildes).
 */
const toDomain = (input: ReturnType<typeof crearTurnoSchema.parse>): Omit<Turno, 'id'> => {
  const map: Record<string, Turno['especialidad']> = {
    'Clínica médica': 'clinica medica',
    Pediatría: 'pediatria',
    Odontología: 'odontologia',
    Nutrición: 'nutricion',
  };
  return {
    paciente: input.paciente,
    documento: input.documento,
    especialidad: map[input.especialidad],
    fecha: input.fecha,
    hora: input.hora,
    confirmado: input.confirmado,
    ...(input.observaciones ? { observaciones: input.observaciones } : {}),
  };
};

export const getTurnos = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const filtros = filtroTurnosSchema.parse(req.query);
    const turnos = turnosService.listar(filtros);
    res.status(200).json(turnos);
  } catch (err) {
    next(err);
  }
};

export const getTurnoPorId = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, 'INVALID_ID', 'El id debe ser un entero positivo.');
    }
    const turno = turnosService.obtenerPorId(id);
    if (!turno) {
      throw new AppError(404, 'NOT_FOUND', `Turno con id ${id} no encontrado.`);
    }
    res.status(200).json(turno);
  } catch (err) {
    next(err);
  }
};

export const crearTurno = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const data = crearTurnoSchema.parse(req.body);
    const creado = turnosService.crear(toDomain(data));
    res.status(201).json(creado);
  } catch (err) {
    next(err);
  }
};

export const actualizarTurno = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, 'INVALID_ID', 'El id debe ser un entero positivo.');
    }
    const cambios = actualizarTurnoSchema.parse(req.body);
    const partial: Partial<Omit<Turno, 'id'>> = {};
    if (cambios.paciente !== undefined) partial.paciente = cambios.paciente;
    if (cambios.documento !== undefined) partial.documento = cambios.documento;
    if (cambios.especialidad !== undefined) {
      const map: Record<string, Turno['especialidad']> = {
        'Clínica médica': 'clinica medica',
        Pediatría: 'pediatria',
        Odontología: 'odontologia',
        Nutrición: 'nutricion',
      };
      partial.especialidad = map[cambios.especialidad];
    }
    if (cambios.fecha !== undefined) partial.fecha = cambios.fecha;
    if (cambios.hora !== undefined) partial.hora = cambios.hora;
    if (cambios.confirmado !== undefined) partial.confirmado = cambios.confirmado;
    if (cambios.observaciones !== undefined) partial.observaciones = cambios.observaciones;

    const actualizado = turnosService.actualizar(id, partial);
    if (!actualizado) {
      throw new AppError(404, 'NOT_FOUND', `Turno con id ${id} no encontrado.`);
    }
    res.status(200).json(actualizado);
  } catch (err) {
    next(err);
  }
};

export const eliminarTurno = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, 'INVALID_ID', 'El id debe ser un entero positivo.');
    }
    const eliminado = turnosService.eliminar(id);
    if (!eliminado) {
      throw new AppError(404, 'NOT_FOUND', `Turno con id ${id} no encontrado.`);
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
