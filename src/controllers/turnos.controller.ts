import type { Request, Response, NextFunction } from 'express';
import { turnosService } from '../services/turnos.service.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  crearTurnoSchema,
  actualizarTurnoSchema,
  filtroTurnosSchema,
} from '../schemas/turno.schema.js';
import type { Turno } from '../models/turno.model.js';

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

export const getTurnos = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  let status = 200;
  try {
    const filtros = filtroTurnosSchema.parse(req.query);
    const turnos = turnosService.listar(filtros);
    return res.status(status).json(turnos);
  } catch (err) {
    status = 500;
    return next(err);
  }
};

export const getTurnoPorId = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  let status = 200;
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      status = 400;
      throw new AppError(status, 'INVALID_ID', 'El id debe ser un entero positivo.');
    }
    const turno = turnosService.obtenerPorId(id);
    if (!turno) {
      status = 404;
      throw new AppError(status, 'NOT_FOUND', `Turno con id ${id} no encontrado.`);
    }
    return res.status(status).json(turno);
  } catch (err) {
    return next(err);
  }
};

export const crearTurno = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  let status = 201;
  try {
    const data = crearTurnoSchema.parse(req.body);
    const creado = turnosService.crear(toDomain(data));
    return res.status(status).json(creado);
  } catch (err) {
    status = 400;
    return next(err);
  }
};

export const actualizarTurno = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  let status = 200;
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      status = 400;
      throw new AppError(status, 'INVALID_ID', 'El id debe ser un entero positivo.');
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
      status = 404;
      throw new AppError(status, 'NOT_FOUND', `Turno con id ${id} no encontrado.`);
    }
    return res.status(status).json(actualizado);
  } catch (err) {
    return next(err);
  }
};

export const eliminarTurno = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  let status = 204;
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      status = 400;
      throw new AppError(status, 'INVALID_ID', 'El id debe ser un entero positivo.');
    }
    const eliminado = turnosService.eliminar(id);
    if (!eliminado) {
      status = 404;
      throw new AppError(status, 'NOT_FOUND', `Turno con id ${id} no encontrado.`);
    }
    return res.status(status).send();
  } catch (err) {
    return next(err);
  }
};
