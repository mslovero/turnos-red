import 'dotenv/config';

export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  TURNOS_FILE: process.env.TURNOS_FILE ?? './data/turnos.json',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;
