import type { Request, Response, NextFunction } from 'express';
import { medicosService } from '../services/medicos.service.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  crearMedicoSchema,
  actualizarMedicoSchema,
  filtroMedicosSchema,
} from '../schemas/medico.schema.js';

export const getMedicos = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const filtros = filtroMedicosSchema.parse(req.query);
    const medicos = medicosService.listar(filtros);
    res.status(200).json(medicos);
  } catch (err) {
    next(err);
  }
};

export const getMedicoPorId = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, 'INVALID_ID', 'El id debe ser un entero positivo.');
    }
    const medico = medicosService.obtenerPorId(id);
    if (!medico) {
      throw new AppError(404, 'NOT_FOUND', `Médico con id ${id} no encontrado.`);
    }
    res.status(200).json(medico);
  } catch (err) {
    next(err);
  }
};

export const crearMedico = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const data = crearMedicoSchema.parse(req.body);
    const creado = medicosService.crear(data);
    res.status(201).json(creado);
  } catch (err) {
    next(err);
  }
};

export const actualizarMedico = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, 'INVALID_ID', 'El id debe ser un entero positivo.');
    }
    const cambios = actualizarMedicoSchema.parse(req.body);
    const actualizado = medicosService.actualizar(id, cambios);
    if (!actualizado) {
      throw new AppError(404, 'NOT_FOUND', `Médico con id ${id} no encontrado.`);
    }
    res.status(200).json(actualizado);
  } catch (err) {
    next(err);
  }
};

export const eliminarMedico = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, 'INVALID_ID', 'El id debe ser un entero positivo.');
    }
    const eliminado = medicosService.eliminar(id);
    if (!eliminado) {
      throw new AppError(404, 'NOT_FOUND', `Médico con id ${id} no encontrado.`);
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
