import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

/**
 * Middleware factory que valida req.body contra un schema Zod.
 * Si falla, delega al errorHandler que estandariza la respuesta.
 */
export const validateBody =
  <T>(schema: ZodType<T>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };

/**
 * Middleware factory que valida req.query contra un schema Zod.
 */
export const validateQuery =
  <T>(schema: ZodType<T>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      Object.defineProperty(req, 'validatedQuery', {
        value: parsed,
        writable: false,
        enumerable: true,
      });
      next();
    } catch (err) {
      next(err);
    }
  };
