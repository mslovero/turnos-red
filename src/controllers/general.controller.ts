import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler.js';

/**
 * GET / — Endpoint de bienvenida (Hello World).
 */
export const getBienvenida = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  let status = 200;
  try {
    const payload = {
      app: 'TurnosRed API',
      version: '2.0.0',
      message: '¡Bienvenido/a a la API de TurnosRed!',
      endpoints: {
        turnos: '/turnos',
        medicos: '/medicos',
        health: '/health',
      },
    };
    return res.status(status).json(payload);
  } catch (err) {
    status = 500;
    return next(err);
  }
};

/**
 * Middleware 404: cualquier ruta no definida cae acá y recibe el formato estándar de error.
 */
export const notFoundController = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    throw new AppError(404, 'ROUTE_NOT_FOUND', `La ruta ${req.method} ${req.originalUrl} no existe.`);
  } catch (err) {
    return next(err);
  }
};
