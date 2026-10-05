import type { Turno, TurnoCrudo, Especialidad } from '../models/turno.model.js';

/**
 * Mapea los valores de especialidad que llegan desde las distintas sedes
 * (con tildes, mayúsculas, abreviaciones) al conjunto normalizado del dominio.
 */
const MAPA_ESPECIALIDADES: Record<string, Especialidad> = {
  'clinica medica': 'clinica medica',
  'clínica médica': 'clinica medica',
  clinica: 'clinica medica',
  pediatria: 'pediatria',
  pediatría: 'pediatria',
  odontologia: 'odontologia',
  odontología: 'odontologia',
  nutricion: 'nutricion',
  nutrición: 'nutricion',
};

/**
 * Elimina tildes y pasa a minúsculas para comparar textos.
 */
const normalizarTexto = (valor: string): string =>
  valor.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

/**
 * Convierte un valor a entero positivo. Devuelve null si no es válido.
 */
const toEnteroPositivo = (valor: unknown): number | null => {
  const n = typeof valor === 'string' ? Number(valor) : (valor as number);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
};

/**
 * Normaliza "14/08/2026" o "14-08-2026" o "2026-08-14" a formato ISO YYYY-MM-DD.
 */
const normalizarFecha = (valor: string): string | null => {
  const limpio = valor.trim();
  // dd/mm/yyyy o dd-mm-yyyy
  const match1 = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(limpio);
  if (match1) {
    const [, dd, mm, yyyy] = match1;
    return `${yyyy}-${mm}-${dd}`;
  }
  // yyyy-mm-dd (ya ISO)
  const match2 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(limpio);
  if (match2) return limpio;
  return null;
};

/**
 * Normaliza "10.00", "10:00", "10h00" a "HH:MM".
 */
const normalizarHora = (valor: string): string | null => {
  const limpio = valor.trim().replace(/[.hH]/g, ':');
  const match = /^(\d{1,2}):(\d{2})$/.exec(limpio);
  if (!match) return null;
  const [, h, m] = match;
  const hh = Number(h);
  const mm = Number(m);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};

/**
 * Normaliza "si", "sí", "yes", true, 1 a booleano.
 */
const normalizarBooleano = (valor: unknown): boolean => {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'number') return valor === 1;
  if (typeof valor === 'string') {
    const v = normalizarTexto(valor);
    return v === 'si' || v === 'sí' || v === 'yes' || v === 'true' || v === '1';
  }
  return false;
};

/**
 * Transforma un registro crudo al dominio Turno aplicando coerción de tipos y validaciones.
 * Devuelve null si el registro no cumple con la estructura mínima.
 */
export const normalizarTurno = (crudo: TurnoCrudo): Turno | null => {
  const id = toEnteroPositivo(crudo.id);
  if (id === null) return null;

  if (!crudo.paciente || typeof crudo.paciente !== 'string') return null;
  const paciente = crudo.paciente.trim().replace(/\s+/g, ' ');
  if (paciente.length === 0) return null;

  const documento = String(crudo.documento ?? '').trim();
  if (!/^\d+$/.test(documento)) return null;

  const espKey = normalizarTexto(String(crudo.especialidad ?? ''));
  const especialidad = MAPA_ESPECIALIDADES[espKey];
  if (!especialidad) return null;

  const fecha = normalizarFecha(String(crudo.fecha ?? ''));
  if (!fecha) return null;

  const hora = normalizarHora(String(crudo.hora ?? ''));
  if (!hora) return null;

  const confirmado = normalizarBooleano(crudo.confirmado);

  const turno: Turno = {
    id,
    paciente,
    documento,
    especialidad,
    fecha,
    hora,
    confirmado,
  };

  if (crudo.observaciones && typeof crudo.observaciones === 'string') {
    const obs = crudo.observaciones.trim();
    if (obs.length > 0) turno.observaciones = obs;
  }

  return turno;
};

/**
 * Normaliza un arreglo de registros crudos y retorna solo los válidos,
 * registrando por consola la cantidad aceptada y rechazada.
 */
export const normalizarLote = (
  crudos: TurnoCrudo[],
): { turnos: Turno[]; aceptados: number; rechazados: number } => {
  const turnos: Turno[] = [];
  let rechazados = 0;

  for (const crudo of crudos) {
    const turno = normalizarTurno(crudo);
    if (turno) {
      turnos.push(turno);
    } else {
      rechazados++;
    }
  }

  console.log(`[normalizador] Registros aceptados: ${turnos.length} | rechazados: ${rechazados}`);
  return { turnos, aceptados: turnos.length, rechazados };
};
