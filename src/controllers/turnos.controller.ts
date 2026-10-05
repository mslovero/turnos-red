import type { Request, Response } from 'express';
import { turnosService } from '../services/turnos.service.js';
import { normalizarTurno } from '../utils/normalizador.js';
import type { TurnoCrudo, TurnoActualizacion } from '../models/turno.model.js';

/**
 * GET /turnos
 */
export const getTurnos = (_req: Request, res: Response): void => {
  const turnos = turnosService.listar();
  res.status(200).json(turnos);
};

/**
 * GET /turnos/:id
 */
export const getTurnoPorId = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'El id debe ser un entero positivo.' });
    return;
  }

  const turno = turnosService.obtenerPorId(id);
  if (!turno) {
    res.status(404).json({ error: `Turno con id ${id} no encontrado.` });
    return;
  }

  res.status(200).json(turno);
};

/**
 * POST /turnos
 */
export const crearTurno = (req: Request, res: Response): void => {
  try {
    const body = req.body as TurnoCrudo;
    const normalizado = normalizarTurno({ ...body, id: body.id ?? 1 });
    if (!normalizado) {
      res.status(400).json({ error: 'Los datos del turno no cumplen con el formato esperado.' });
      return;
    }

    // El id lo asigna el servicio; sacamos el id normalizado y pasamos el resto.
    const { id: _descartado, ...sinId } = normalizado;
    void _descartado;
    const creado = turnosService.crear(sinId);
    res.status(201).json(creado);
  } catch (error) {
    console.error('[crearTurno] Error:', error);
    res.status(500).json({ error: 'Error interno al crear el turno.' });
  }
};

/**
 * PUT /turnos/:id
 */
export const actualizarTurno = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'El id debe ser un entero positivo.' });
    return;
  }

  try {
    const cambios = req.body as TurnoActualizacion;
    const actualizado = turnosService.actualizar(id, cambios);
    if (!actualizado) {
      res.status(404).json({ error: `Turno con id ${id} no encontrado.` });
      return;
    }
    res.status(200).json(actualizado);
  } catch (error) {
    console.error('[actualizarTurno] Error:', error);
    res.status(500).json({ error: 'Error interno al actualizar el turno.' });
  }
};

/**
 * DELETE /turnos/:id
 */
export const eliminarTurno = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'El id debe ser un entero positivo.' });
    return;
  }

  const eliminado = turnosService.eliminar(id);
  if (!eliminado) {
    res.status(404).json({ error: `Turno con id ${id} no encontrado.` });
    return;
  }
  res.status(200).json({ mensaje: `Turno ${id} eliminado correctamente.` });
};
