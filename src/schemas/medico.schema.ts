import { z } from 'zod';
import { especialidadSchema } from './turno.schema.js';

/**
 * Schema de dominio Medico.
 */
export const medicoSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  apellido: z.string().trim().min(1, 'El apellido es obligatorio.'),
  matricula: z.string().trim().min(1, 'La matrícula es obligatoria.'),
  documento: z.string().regex(/^\d+$/, 'El documento debe contener solo dígitos.'),
  especialidad: especialidadSchema,
  disponible: z.boolean(),
  email: z.email('El email debe tener un formato válido.').optional(),
});

export const crearMedicoSchema = medicoSchema.omit({ id: true });
export const actualizarMedicoSchema = medicoSchema.omit({ id: true }).partial();

export const filtroMedicosSchema = z.object({
  especialidad: especialidadSchema.optional(),
  disponible: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export type Medico = z.infer<typeof medicoSchema>;
export type MedicoInput = z.infer<typeof crearMedicoSchema>;
export type MedicoUpdate = z.infer<typeof actualizarMedicoSchema>;
export type FiltroMedicos = z.infer<typeof filtroMedicosSchema>;
