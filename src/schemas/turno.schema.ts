import { z } from 'zod';

/**
 * Especialidades aceptadas en formato Title Case.
 */
export const ESPECIALIDADES = ['Clínica médica', 'Pediatría', 'Odontología', 'Nutrición'] as const;

export const especialidadSchema = z.enum(ESPECIALIDADES, {
  message: 'La especialidad debe ser una de: Clínica médica, Pediatría, Odontología o Nutrición.',
});

/**
 * Schema de dominio Turno (ya normalizado).
 */
export const turnoSchema = z.object({
  id: z.number().int().positive(),
  paciente: z.string().trim().min(1, 'El paciente es obligatorio.'),
  documento: z.string().regex(/^\d+$/, 'El documento debe contener solo dígitos.'),
  especialidad: especialidadSchema,
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe estar en formato YYYY-MM-DD.'),
  hora: z.string().regex(/^\d{2}:\d{2}$/, 'La hora debe estar en formato HH:MM.'),
  confirmado: z.boolean(),
  medicoId: z.number().int().positive().optional(),
  observaciones: z.string().optional(),
});

/**
 * Schema para la creación (POST). Sin id, con todos los campos requeridos.
 */
export const crearTurnoSchema = turnoSchema.omit({ id: true });

/**
 * Schema para la actualización (PUT). Todos los campos opcionales excepto el id (va por URL).
 */
export const actualizarTurnoSchema = turnoSchema.omit({ id: true }).partial();

/**
 * Schema para query params de filtrado en GET /turnos.
 */
export const filtroTurnosSchema = z.object({
  especialidad: especialidadSchema.optional(),
  fecha: z
    .string()
    .regex(
      /^\d{2}\/\d{2}\/\d{4}$|^\d{4}-\d{2}-\d{2}$/,
      'La fecha debe tener formato dd/mm/yyyy o YYYY-MM-DD.',
    )
    .optional(),
  medicoId: z.coerce.number().int().positive().optional(),
});

export type TurnoInput = z.infer<typeof crearTurnoSchema>;
export type TurnoUpdate = z.infer<typeof actualizarTurnoSchema>;
export type FiltroTurnos = z.infer<typeof filtroTurnosSchema>;
