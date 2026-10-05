# TurnosRed – Backend

Backend para centralizar la gestión de turnos médicos de varias sedes de atención
ambulatoria (clínica médica, pediatría, odontología y nutrición).

- Node.js (LTS) + TypeScript estricto + ESM
- Express para la API REST
- Socket.IO para notificaciones en tiempo real
- EventEmitter nativo como bus de eventos interno
- Lectura asincrónica de archivos con `node:fs/promises`

---

## Requisitos previos

- [Node.js](https://nodejs.org/en/download) 20+ (LTS). Se recomienda [NVM](https://github.com/nvm-sh/nvm) y usar el `.nvmrc` incluido:
  ```bash
  nvm install
  nvm use
  ```
- npm 10+ (viene con Node). **No usar yarn ni pnpm** (ver `.gitignore`).
- Git.

## Instalación

```bash
git clone https://github.com/<usuario>/turnos-red.git
cd turnos-red
nvm use
npm install
cp env.example.txt .env
```

## Scripts npm disponibles

| Script           | Descripción                                                       |
| ---------------- | ----------------------------------------------------------------- |
| `npm run dev`    | Levanta el servidor en modo watch con `tsx`.                      |
| `npm run build`  | Compila TypeScript a `dist/`.                                     |
| `npm start`      | Ejecuta el build de `dist/`.                                      |
| `npm run lint`   | Chequea el código con ESLint.                                     |
| `npm run lint:fix` | Aplica fixes automáticos de ESLint.                             |
| `npm run format` | Formatea `src/` con Prettier.                                     |
| `npm run format:check` | Verifica formato sin modificar archivos.                    |

## Variables de entorno

| Variable      | Descripción                                            | Valor por defecto         |
| ------------- | ------------------------------------------------------ | ------------------------- |
| `PORT`        | Puerto HTTP del servidor Express + Socket.IO.          | `3000`                    |
| `TURNOS_FILE` | Ruta al JSON con los turnos crudos de las sedes.       | `./data/turnos.json`      |
| `NODE_ENV`    | Entorno de ejecución (`development` / `production`).   | `development`             |

## Estructura de carpetas

```
turnos-red/
├── .vscode/
│   └── launch.json           # Configuración de debug para VS Code
├── data/
│   └── turnos.json           # Archivo con registros crudos de las sedes
├── public/
│   └── index.html            # Cliente web Socket.IO (demo)
├── src/
│   ├── config/
│   │   └── env.ts            # Carga y expone las variables de entorno
│   ├── controllers/
│   │   └── turnos.controller.ts
│   ├── events/
│   │   └── eventBus.ts       # Bus de eventos interno con EventEmitter tipado
│   ├── models/
│   │   └── turno.model.ts    # Interfaces TurnoCrudo y Turno
│   ├── routes/
│   │   └── turnos.routes.ts
│   ├── services/
│   │   └── turnos.service.ts # Lógica de negocio + emisión de eventos
│   ├── utils/
│   │   ├── fileReader.ts     # Lectura asincrónica (fs/promises)
│   │   └── normalizador.ts   # Coerción de tipos y validaciones
│   └── index.ts              # Bootstrap de la aplicación
├── .env.example (env.example.txt)
├── .gitignore
├── .nvmrc
├── .eslintrc.cjs
├── .prettierrc.json
├── package.json
└── tsconfig.json
```

## Endpoints REST

| Método | Ruta             | Descripción                      | Códigos de estado         |
| ------ | ---------------- | -------------------------------- | ------------------------- |
| GET    | `/turnos`        | Lista todos los turnos.          | 200                       |
| GET    | `/turnos/:id`    | Obtiene un turno por id.         | 200, 400, 404             |
| POST   | `/turnos`        | Crea un nuevo turno.             | 201, 400, 500             |
| PUT    | `/turnos/:id`    | Actualiza un turno.              | 200, 400, 404, 500        |
| DELETE | `/turnos/:id`    | Elimina un turno.                | 200, 400, 404             |

### Payload de ejemplo (POST /turnos)

```json
{
  "paciente": "   Carlos Ruiz ",
  "documento": 31654210,
  "especialidad": "PEDIATRÍA",
  "fecha": "14/08/2026",
  "hora": "10.00",
  "confirmado": "si",
  "observaciones": "Primera consulta"
}
```

El servidor normaliza automáticamente los datos (trim, mayúsculas/minúsculas,
formato de fecha y hora, booleanos, etc.).

## Eventos en tiempo real

Cada operación exitosa de modificación emite un evento interno con `EventEmitter`
que es retransmitido vía Socket.IO a todos los clientes conectados:

| Evento interno       | Evento Socket.IO     | Payload              |
| -------------------- | -------------------- | -------------------- |
| `turno:creado`       | `turno:nuevo`        | `Turno`              |
| `turno:actualizado`  | `turno:actualizado`  | `Turno`              |
| `turno:eliminado`    | `turno:eliminado`    | `{ id: number }`     |

### Cliente de prueba

Abrí `public/index.html` en el navegador mientras el servidor corre.
La página se conecta por WebSocket y muestra cada evento en vivo sin recargar.

## Debugging en VS Code

El archivo `.vscode/launch.json` ya incluye dos configuraciones:

- **Debug (tsx)**: ejecuta `src/index.ts` con `tsx` y breakpoints activos.
- **Debug (build)**: compila el proyecto y debuggea el output de `dist/`.

Abrí el panel **Run and Debug** (⇧⌘D) y presioná ▶️.

## Autora

María Soledad Lovero – Octubre 2026.
