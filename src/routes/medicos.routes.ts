import { Router } from 'express';
import {
  getMedicos,
  getMedicoPorId,
  crearMedico,
  actualizarMedico,
  eliminarMedico,
} from '../controllers/medicos.controller.js';

export const medicosRouter = Router();

medicosRouter.get('/', getMedicos);
medicosRouter.get('/:id', getMedicoPorId);
medicosRouter.post('/', crearMedico);
medicosRouter.put('/:id', actualizarMedico);
medicosRouter.delete('/:id', eliminarMedico);
