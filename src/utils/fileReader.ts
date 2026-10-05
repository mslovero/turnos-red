import { readFile } from 'node:fs/promises';
import type { TurnoCrudo } from '../models/turno.model.js';

/**
 * Lee un archivo JSON de turnos crudos de forma asincrónica (fs/promises + async/await).
 * El manejo de errores se centraliza con try/catch.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * COMPARACIÓN: por qué usamos PROMESAS en lugar de CALLBACKS
 * ─────────────────────────────────────────────────────────────────────────
 * La API clásica de node:fs utiliza callbacks, lo que lleva al "callback hell"
 * cuando hay varias operaciones encadenadas:
 *
 *   import { readFile } from 'node:fs';
 *   readFile('./data/turnos.json', 'utf-8', (err, data) => {
 *     if (err) {
 *       console.error('Error leyendo:', err);
 *       return;
 *     }
 *     try {
 *       const parsed = JSON.parse(data);
 *       // ... y seguir anidando callbacks si hay más operaciones
 *     } catch (e) {
 *       console.error('Error parseando:', e);
 *     }
 *   });
 *
 * Con fs/promises + async/await el flujo es lineal, se compone mejor con
 * otras promesas (Promise.all, etc.) y los errores se capturan con try/catch
 * de forma uniforme.
 */
export const leerTurnosCrudos = async (rutaArchivo: string): Promise<TurnoCrudo[]> => {
  try {
    const contenido = await readFile(rutaArchivo, 'utf-8');
    const parsed: unknown = JSON.parse(contenido);
    if (!Array.isArray(parsed)) {
      throw new Error(`El archivo ${rutaArchivo} no contiene un arreglo de turnos.`);
    }
    return parsed as TurnoCrudo[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[fileReader] Archivo no encontrado: ${rutaArchivo}. Se devuelve lista vacía.`);
      return [];
    }
    console.error('[fileReader] Error leyendo turnos:', error);
    throw error;
  }
};
