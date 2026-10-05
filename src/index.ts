import express from 'express';
import { createServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './config/env.js';
import { turnosRouter } from './routes/turnos.routes.js';
import { medicosRouter } from './routes/medicos.routes.js';
import { turnosService } from './services/turnos.service.js';
import { eventBus, TURNO_EVENTS } from './events/eventBus.js';
import { leerTurnosCrudos } from './utils/fileReader.js';
import { normalizarLote } from './utils/normalizador.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getBienvenida, notFoundController } from './controllers/general.controller.js';

async function bootstrap(): Promise<void> {
  const app = express();
  app.use(express.json());

  // Endpoints generales (Hello World + health)
  app.get('/', getBienvenida);
  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  // Rutas REST
  app.use('/turnos', turnosRouter);
  app.use('/medicos', medicosRouter);

  // 404 general + manejador global de errores (SIEMPRE al final)
  app.use(notFoundController);
  app.use(errorHandler);

  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, { cors: { origin: '*' } });

  eventBus.on(TURNO_EVENTS.CREADO, (turno) => {
    io.emit('turno:nuevo', turno);
    console.log(`[socket] turno:nuevo emitido (id=${turno.id})`);
  });
  eventBus.on(TURNO_EVENTS.ACTUALIZADO, (turno) => {
    io.emit('turno:actualizado', turno);
    console.log(`[socket] turno:actualizado emitido (id=${turno.id})`);
  });
  eventBus.on(TURNO_EVENTS.ELIMINADO, (payload) => {
    io.emit('turno:eliminado', payload);
    console.log(`[socket] turno:eliminado emitido (id=${payload.id})`);
  });

  io.on('connection', (socket) => {
    console.log(`[socket] cliente conectado: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`[socket] cliente desconectado: ${socket.id}`);
    });
  });

  const crudos = await leerTurnosCrudos(env.TURNOS_FILE);
  const { turnos } = normalizarLote(crudos);
  turnosService.cargarInicial(turnos);

  httpServer.listen(env.PORT, () => {
    console.log(`[servidor] escuchando en http://localhost:${env.PORT}`);
    console.log(`[servidor] entorno: ${env.NODE_ENV}`);
  });
}

bootstrap().catch((error) => {
  console.error('[bootstrap] Error fatal:', error);
  process.exit(1);
});
