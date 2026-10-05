import type { Request, Response, NextFunction } from 'express';
import { medicosService } from '../services/medicos.service.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  crearMedicoSchema,
  actualizarMedicoSchema,
  filtroMedicosSchema,
} from '../schemas/medico.schema.js';

export const getMedicos = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  let status = 200;
  try {
    const filtros = filtroMedicosSchema.parse(req.query);
    const medicos = medicosService.listar(filtros);
    return res.status(status).json(medicos);
  } catch (err) {
    status = 500;
    return next(err);
  }
};

export const getMedicoPorId = async (
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
    const medico = medicosService.obtenerPorId(id);
    if (!medico) {
      status = 404;
      throw new AppError(status, 'NOT_FOUND', `Médico con id ${id} no encontrado.`);
    }
    return res.status(status).json(medico);
  } catch (err) {
    return next(err);
  }
};

export const crearMedico = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  let status = 201;
  try {
    const data = crearMedicoSchema.parse(req.body);
    const creado = medicosService.crear(data);
    return res.status(status).json(creado);
  } catch (err) {
    status = 400;
    return next(err);
  }
};

export const actualizarMedico = async (
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
    const cambios = actualizarMedicoSchema.parse(req.body);
    const actualizado = medicosService.actualizar(id, cambios);
    if (!actualizado) {
      status = 404;
      throw new AppError(status, 'NOT_FOUND', `Médico con id ${id} no encontrado.`);
    }
    return res.status(status).json(actualizado);
  } catch (err) {
    return next(err);
  }
};

export const eliminarMedico = async (
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
    const eliminado = medicosService.eliminar(id);
    if (!eliminado) {
      status = 404;
      throw new AppError(status, 'NOT_FOUND', `Médico con id ${id} no encontrado.`);
    }
    return res.status(status).send();
  } catch (err) {
    return next(err);
  }
};
