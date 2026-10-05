# TurnosRed – Backend

Backend para centralizar la gestión de turnos médicos de varias sedes de atención
ambulatoria (clínica médica, pediatría, odontología y nutrición).

- Node.js (LTS) + TypeScript estricto + ESM
- Express para la API REST
- Socket.IO para notificaciones en tiempo real
- EventEmitter nativo como bus de eventos interno
- Zod para validación de esquemas de entrada
- Middleware global de errores con formato JSON estandarizado

---

## Requisitos previos

- [Node.js](https://nodejs.org/en/download) 20+ (LTS). Se recomienda [NVM](https://github.com/nvm-sh/nvm) y usar el `.nvmrc`:
  ```bash
  nvm install
  nvm use
  ```
- npm 10+ (viene con Node). **No usar yarn ni pnpm**.
- Git.

## Instalación

```bash
git clone https://github.com/mslovero/turnos-red.git
cd turnos-red
nvm use
npm install
cp env.example.txt .env
npm run dev
```

## Scripts npm disponibles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Levanta el servidor en modo watch con `tsx`. |
| `npm run build` | Compila TypeScript a `dist/`. |
| `npm start` | Ejecuta el build de `dist/`. |
| `npm run lint` | Chequea el código con ESLint. |
| `npm run lint:fix` | Aplica fixes automáticos de ESLint. |
| `npm run format` | Formatea `src/` con Prettier. |

## Variables de entorno

| Variable | Descripción | Valor por defecto |
| --- | --- | --- |
| `PORT` | Puerto HTTP del servidor Express + Socket.IO. | `3000` |
| `TURNOS_FILE` | Ruta al JSON con los turnos crudos de las sedes. | `./data/turnos.json` |
| `NODE_ENV` | Entorno de ejecución. | `development` |

## Estructura de carpetas (todas en inglés)

```
turnos-red/
├── .vscode/launch.json       # Configuración de debug para VS Code
├── data/turnos.json          # Registros crudos de las sedes
├── postman/                  # Colección exportada
│   └── turnos-red.postman_collection.json
├── public/index.html         # Cliente web Socket.IO (demo)
├── src/
│   ├── config/env.ts         # Variables de entorno
│   ├── controllers/
│   │   ├── turnos.controller.ts
│   │   └── medicos.controller.ts
│   ├── events/eventBus.ts    # Bus de eventos EventEmitter tipado
│   ├── middleware/
│   │   ├── errorHandler.ts   # Middleware global de errores + AppError
│   │   └── validate.ts       # Validación de req.body / req.query
│   ├── models/
│   │   ├── turno.model.ts
│   │   └── medico.model.ts
│   ├── routes/
│   │   ├── turnos.routes.ts
│   │   └── medicos.routes.ts
│   ├── schemas/              # Zod schemas
│   │   ├── turno.schema.ts
│   │   └── medico.schema.ts
│   ├── services/
│   │   ├── turnos.service.ts
│   │   └── medicos.service.ts
│   ├── utils/
│   │   ├── fileReader.ts     # Lectura asincrónica (fs/promises)
│   │   └── normalizador.ts   # Coerción de tipos para datos crudos
│   └── index.ts              # Bootstrap de la aplicación
├── env.example.txt
├── .gitignore
├── .nvmrc
└── package.json
```

## Endpoints REST

### Recurso `/turnos`

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/turnos` | Lista todos los turnos. Admite query params. | 200 |
| GET | `/turnos/:id` | Obtiene un turno por id. | 200, 400, 404 |
| POST | `/turnos` | Crea un turno (valida con Zod). | 201, 400 |
| PUT | `/turnos/:id` | Actualiza un turno. | 200, 400, 404 |
| DELETE | `/turnos/:id` | Elimina un turno. | 204, 400, 404 |

**Query params soportados en GET /turnos:**

```
GET /turnos?especialidad=Pediatría&fecha=14/08/2026&medicoId=1
```

### Recurso `/medicos`

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/medicos` | Lista todos los médicos. Admite query params. | 200 |
| GET | `/medicos/:id` | Obtiene un médico por id. | 200, 400, 404 |
| POST | `/medicos` | Registra un nuevo médico. | 201, 400 |
| PUT | `/medicos/:id` | Actualiza un médico. | 200, 400, 404 |
| DELETE | `/medicos/:id` | Da de baja un médico. | 204, 400, 404 |

**Query params soportados en GET /medicos:**

```
GET /medicos?especialidad=Odontología&disponible=true
```

### Formato estándar de errores

Todas las respuestas de error devuelven el mismo contrato:

```json
{
  "status": 400,
  "message": "Error de validación en los datos ingresados",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "especialidad", "message": "...", "code": "invalid_enum_value" }
  ]
}
```

Códigos de error utilizados: `VALIDATION_ERROR`, `NOT_FOUND`, `INVALID_ID`, `INTERNAL_SERVER_ERROR`.

### Payload de ejemplo (POST /turnos)

```json
{
  "paciente": "Juan Pérez",
  "documento": "35123456",
  "especialidad": "Clínica médica",
  "fecha": "2026-08-20",
  "hora": "11:30",
  "confirmado": true,
  "observaciones": "Primera consulta"
}
```

Especialidades válidas (Title Case / PascalCase): `Clínica médica`, `Pediatría`, `Odontología`, `Nutrición`.

### Payload de ejemplo (POST /medicos)

```json
{
  "nombre": "Diego",
  "apellido": "Sosa",
  "matricula": "MP-99999",
  "documento": "36123456",
  "especialidad": "Pediatría",
  "disponible": true,
  "email": "dsosa@turnosred.com"
}
```

## Eventos en tiempo real (Socket.IO)

| Evento interno | Evento Socket.IO | Payload |
| --- | --- | --- |
| `turno:creado` | `turno:nuevo` | `Turno` |
| `turno:actualizado` | `turno:actualizado` | `Turno` |
| `turno:eliminado` | `turno:eliminado` | `{ id: number }` |

Cliente de prueba: abrir `public/index.html` en el navegador mientras el servidor corre.

## Colección Postman

El archivo `postman/turnos-red.postman_collection.json` contiene:

- Variables de entorno (`baseUrl`, `turnoId`, `medicoId`).
- Scripts de test con aserciones (status code, estructura JSON).
- Escenarios Happy Path y de error (Bad Request, Not Found, Validation).
- Ejemplos de respuestas listos para usar como Mock Server.

Importar en Postman desde: Collections → Import → seleccionar el archivo JSON.

## Uso de Inteligencia Artificial

Durante el desarrollo de esta actividad se utilizó Claude (Anthropic) como asistente de código. A continuación se detallan los principales usos:

| Tarea | Herramienta | Prompt | Respuesta generada | Ajuste manual aplicado |
| --- | --- | --- | --- | --- |
| Diseño de la estructura en capas en inglés | Claude | "Armá la arquitectura de un backend TypeScript con separación en routes/controllers/services/schemas/models para los recursos Turno y Medico." | Esqueleto completo de carpetas y archivos con imports relativos y `type: module`. | Ajuste de extensiones `.js` en imports para que funcione con ESM + Node 20. |
| Schemas Zod para Turno y Medico | Claude | "Armá los schemas Zod para validar: id positivo, documento sólo dígitos, fecha ISO, hora HH:MM, especialidad en PascalCase (`Clínica médica`, `Pediatría`, `Odontología`, `Nutrición`)." | Zod con `z.object`, `.regex`, `.enum` y mensajes de error en español. | Se agregó mapeo PascalCase → minúsculas para el dominio interno (compatibilidad con normalizador existente). |
| Middleware de errores estandarizado | Claude | "Necesito un middleware Express que capture errores de Zod y AppError y devuelva siempre `{status, message, code, details}`." | Implementación con detección por `instanceof ZodError` y `AppError`. | Agregado `notFoundHandler` adicional y log de errores no controlados. |
| Filtros por query params | Claude | "En el service de turnos agregá filtros por `especialidad`, `fecha` (acepta dd/mm/yyyy y YYYY-MM-DD) y `medicoId` sin romper el listado base." | Service con `.filter()` encadenado y función auxiliar `normalizarFechaFiltro`. | Se agregó compatibilidad hacia atrás: especialidad PascalCase del input se convierte al valor interno. |
| Colección Postman con tests | Claude | "Armá una collection Postman v2.1.0 con variables de entorno, scripts de test en JS, happy paths y escenarios de error para los dos recursos." | JSON válido con `pm.test`, aserciones de status y schema. | Ajuste del `collectionVariables.set` para encadenar IDs creados entre requests (POST→PUT→DELETE). |
| Documentación README | Claude | "Actualizá el README incluyendo endpoints, formato de errores, query params y tabla de IA." | README en Markdown con tablas y ejemplos. | Revisión y ajuste de ejemplos para que coincidan con las especialidades Title Case del dominio. |

**Reflexión personal**: la IA aceleró significativamente el scaffolding y la escritura de boilerplate. El valor humano estuvo en: definir la arquitectura, validar coherencia entre capas, revisar los casos borde (fechas en distintos formatos, especialidades con/sin tildes), y asegurar que el código generado se integre con lo que ya existía del TP1 (normalizador, EventEmitter, Socket.IO).

## Autora

María Soledad Lovero – Octubre 2026.
