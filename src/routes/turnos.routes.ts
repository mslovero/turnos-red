import { Router } from 'express';
import {
  getTurnos,
  getTurnoPorId,
  crearTurno,
  actualizarTurno,
  eliminarTurno,
} from '../controllers/turnos.controller.js';

export const turnosRouter = Router();

turnosRouter.get('/', getTurnos);
turnosRouter.get('/:id', getTurnoPorId);
turnosRouter.post('/', crearTurno);
turnosRouter.put('/:id', actualizarTurno);
turnosRouter.delete('/:id', eliminarTurno);
