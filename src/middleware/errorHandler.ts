import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Formato estandarizado de errores de la API.
 */
export interface ApiErrorBody {
  status: number;
  message: string;
  code: string;
  details: Array<Record<string, unknown>>;
}

/**
 * Error de aplicación que puede lanzarse desde cualquier capa.
 */
export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: Array<Record<string, unknown>> = [],
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Middleware global de manejo de errores.
 * Unifica todas las respuestas fallidas bajo la misma estructura JSON.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Error de validación de Zod
  if (err instanceof ZodError) {
    const body: ApiErrorBody = {
      status: 400,
      message: 'Error de validación en los datos ingresados',
      code: 'VALIDATION_ERROR',
      details: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })),
    };
    res.status(400).json(body);
    return;
  }

  // Error de aplicación controlado
  if (err instanceof AppError) {
    const body: ApiErrorBody = {
      status: err.status,
      message: err.message,
      code: err.code,
      details: err.details,
    };
    res.status(err.status).json(body);
    return;
  }

  // Error genérico no controlado
  console.error('[errorHandler] Error no controlado:', err);
  const body: ApiErrorBody = {
    status: 500,
    message: 'Error interno del servidor',
    code: 'INTERNAL_SERVER_ERROR',
    details: [],
  };
  res.status(500).json(body);
};

/**
 * Middleware 404 para rutas no encontradas.
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  const body: ApiErrorBody = {
    status: 404,
    message: 'Recurso no encontrado.',
    code: 'NOT_FOUND',
    details: [],
  };
  res.status(404).json(body);
};
