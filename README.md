# TurnosRed – Backend

> API REST profesional para centralizar la gestión de turnos médicos de varias sedes de atención
> ambulatoria (clínica médica, pediatría, odontología, nutrición), con eventos en tiempo real,
> validaciones robustas y arquitectura basada en Clean Architecture.

**Stack**: Node.js (LTS) · TypeScript estricto · ESM · Express · Socket.IO · Zod · EventEmitter

**Repositorio**: https://github.com/mslovero/turnos-red

---

## Tabla de contenido

1. [Requisitos previos](#requisitos-previos)
2. [Instalación paso a paso](#instalación-paso-a-paso)
3. [Variables de entorno](#variables-de-entorno)
4. [Scripts npm disponibles](#scripts-npm-disponibles)
5. [Estructura de carpetas](#estructura-de-carpetas-clean-architecture)
6. [Documentación de la API REST](#documentación-de-la-api-rest)
7. [Formato estándar de errores](#formato-estándar-de-errores)
8. [Eventos en tiempo real (Socket.IO)](#eventos-en-tiempo-real-sockeio)
9. [Colección Postman](#colección-postman-con-variables-de-entorno)
10. [Propuesta de módulo Pacientes y Turnos](#propuesta-de-módulo-pacientes-y-turnos-mockup)
11. [Uso de Inteligencia Artificial](#uso-de-inteligencia-artificial)

---

## Requisitos previos

- [Node.js](https://nodejs.org/en/download) **20+** (LTS). Se recomienda [NVM](https://github.com/nvm-sh/nvm) y usar el archivo `.nvmrc` del proyecto:
  ```bash
  nvm install
  nvm use
  ```
- **npm 10+** (viene con Node). **No usar yarn ni pnpm**.
- **Git**.
- **Postman** (o la extensión Postman para VS Code) para las pruebas REST.

## Instalación paso a paso

```bash
# 1. Clonar el repositorio
git clone https://github.com/mslovero/turnos-red.git
cd turnos-red

# 2. Usar la versión correcta de Node
nvm use

# 3. Instalar dependencias
npm install

# 4. Preparar el archivo de variables de entorno
cp env.example.txt .env

# 5. Levantar el servidor en modo desarrollo (watch)
npm run dev
```

El servidor queda escuchando en `http://localhost:3000`.

## Variables de entorno

| Variable | Descripción | Valor por defecto |
| --- | --- | --- |
| `PORT` | Puerto HTTP del servidor Express + Socket.IO. | `3000` |
| `TURNOS_FILE` | Ruta al JSON con los turnos crudos. | `./data/turnos.json` |
| `NODE_ENV` | Entorno de ejecución (`development` / `production`). | `development` |

## Scripts npm disponibles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Levanta el servidor en modo watch con `tsx`. |
| `npm run build` | Compila TypeScript a `dist/`. |
| `npm start` | Ejecuta el build de `dist/`. |
| `npm run lint` | Chequea el código con ESLint. |
| `npm run lint:fix` | Aplica fixes automáticos de ESLint. |
| `npm run format` | Formatea `src/` con Prettier. |

## Estructura de carpetas (Clean Architecture)

```
turnos-red/
├── .vscode/launch.json           # Configuración de debug para VS Code
├── data/turnos.json              # Registros crudos de las sedes
├── postman/                      # Colección Postman
│   └── turnos-red.postman_collection.json
├── public/index.html             # Cliente web Socket.IO (demo)
├── src/
│   ├── config/env.ts             # Variables de entorno
│   ├── controllers/
│   │   ├── general.controller.ts   # Hello World + 404
│   │   ├── turnos.controller.ts
│   │   └── medicos.controller.ts
│   ├── events/eventBus.ts        # Bus EventEmitter tipado
│   ├── middleware/
│   │   ├── errorHandler.ts       # Middleware global de errores + AppError
│   │   └── validate.ts
│   ├── models/
│   │   ├── turno.model.ts
│   │   └── medico.model.ts
│   ├── routes/
│   │   ├── turnos.routes.ts
│   │   └── medicos.routes.ts
│   ├── schemas/                  # Zod schemas
│   │   ├── turno.schema.ts
│   │   └── medico.schema.ts
│   ├── services/
│   │   ├── turnos.service.ts
│   │   └── medicos.service.ts
│   ├── utils/
│   │   ├── fileReader.ts         # Lectura asincrónica (fs/promises)
│   │   └── normalizador.ts
│   └── index.ts                  # Bootstrap de la aplicación
├── pacientes-turnos.md           # Propuesta técnica (TP4)
├── env.example.txt
├── .gitignore                    # Excluye node_modules, dist, .env
├── .nvmrc
├── README.md
└── package.json
```

El archivo `.gitignore` asegura que **no se suban** al repositorio:

- `node_modules/`
- `dist/` (build compilado)
- `.env`, `.env.local` (variables sensibles)

---

## Documentación de la API REST

> URL base: `{{baseUrl}}` (recomendado `http://localhost:3000`).

### Endpoint general

| Método | Path | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/` | Mensaje de bienvenida con índice de endpoints. | 200 |
| GET | `/health` | Health-check del servicio. | 200 |

**Ejemplo — GET /**

```http
GET {{baseUrl}}/
```

Respuesta `200 OK`:

```json
{
  "app": "TurnosRed API",
  "version": "2.0.0",
  "message": "¡Bienvenido/a a la API de TurnosRed!",
  "endpoints": {
    "turnos": "/turnos",
    "medicos": "/medicos",
    "health": "/health"
  }
}
```

### Recurso `/turnos`

| Método | Path | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/turnos` | Lista todos los turnos. Admite query params. | 200 |
| GET | `/turnos/:id` | Obtiene un turno por id. | 200, 400, 404 |
| POST | `/turnos` | Crea un turno (valida con Zod). | 201, 400 |
| PUT | `/turnos/:id` | Actualiza un turno (parcial). | 200, 400, 404 |
| DELETE | `/turnos/:id` | Elimina un turno. | 204, 400, 404 |

**Query params soportados en `GET /turnos`:**

| Param | Tipo | Descripción | Ejemplo |
| --- | --- | --- | --- |
| `especialidad` | `string` (enum Title Case) | Filtra por especialidad. | `?especialidad=Pediatría` |
| `fecha` | `string` | Filtra por fecha (`dd/mm/yyyy` o `YYYY-MM-DD`). | `?fecha=14/08/2026` |
| `medicoId` | `number` | Filtra por médico asignado. | `?medicoId=1` |

Combinable: `GET {{baseUrl}}/turnos?especialidad=Pediatría&fecha=14/08/2026&medicoId=1`

**Body (POST /turnos / PUT /turnos/:id)**

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

Especialidades válidas (**Title Case**): `Clínica médica`, `Pediatría`, `Odontología`, `Nutrición`.

### Recurso `/medicos`

| Método | Path | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/medicos` | Lista todos los médicos. Admite query params. | 200 |
| GET | `/medicos/:id` | Obtiene un médico por id. | 200, 400, 404 |
| POST | `/medicos` | Registra un nuevo médico. | 201, 400 |
| PUT | `/medicos/:id` | Actualiza un médico (parcial). | 200, 400, 404 |
| DELETE | `/medicos/:id` | Da de baja un médico. | 204, 400, 404 |

**Query params soportados en `GET /medicos`:**

| Param | Tipo | Descripción | Ejemplo |
| --- | --- | --- | --- |
| `especialidad` | `string` (enum Title Case) | Filtra por especialidad. | `?especialidad=Odontología` |
| `disponible` | `boolean` | Filtra por disponibilidad. | `?disponible=true` |

**Body (POST /medicos / PUT /medicos/:id)**

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

---

## Formato estándar de errores

Todas las respuestas de error devuelven el **mismo contrato** JSON:

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

| `code` | Status HTTP | Significado |
| --- | --- | --- |
| `VALIDATION_ERROR` | 400 | Error de validación Zod (ver `details`). |
| `INVALID_ID` | 400 | El `:id` no es un entero positivo. |
| `NOT_FOUND` | 404 | Recurso no encontrado por id. |
| `ROUTE_NOT_FOUND` | 404 | La ruta no está definida (controller general). |
| `INTERNAL_SERVER_ERROR` | 500 | Error inesperado del servidor. |

---

## Eventos en tiempo real (Socket.IO)

Cada operación exitosa sobre `/turnos` emite un evento interno con `EventEmitter`, que es retransmitido vía Socket.IO a los clientes conectados:

| Evento interno | Evento Socket.IO | Payload |
| --- | --- | --- |
| `turno:creado` | `turno:nuevo` | `Turno` |
| `turno:actualizado` | `turno:actualizado` | `Turno` |
| `turno:eliminado` | `turno:eliminado` | `{ id: number }` |

**Cliente de prueba**: abrir `public/index.html` en el navegador mientras el servidor corre. La página se conecta por WebSocket y muestra cada evento en vivo sin recargar.

---

## Colección Postman con variables de entorno

El archivo `postman/turnos-red.postman_collection.json` ya contiene **variables centralizadas**:

- **`{{baseUrl}}`** → `http://localhost:3000` (editable desde Postman).
- **`{{turnoId}}`** → se setea automáticamente desde el POST de turno (test script).
- **`{{medicoId}}`** → se setea automáticamente desde el POST de médico.

Todas las peticiones utilizan la sintaxis `{{baseUrl}}/turnos`, `{{baseUrl}}/medicos/:id`, etc., evitando URLs duras. Si cambia el host (por ejemplo al pasar a staging), solo hay que editar la variable `baseUrl` una sola vez.

**Importar en Postman:**

1. Abrir Postman → *Collections* → *Import*.
2. Seleccionar `postman/turnos-red.postman_collection.json`.
3. En *Variables* confirmar que `baseUrl = http://localhost:3000`.
4. Ejecutar el request **GET /turnos** → debería devolver `200 OK` y mostrar los tests en verde (PASS).

La collection incluye:

- Variables de entorno de colección.
- Scripts de test con aserciones (`pm.test`).
- Escenarios Happy Path y de error (Bad Request, Not Found, Validation).
- Ejemplos de respuestas listos para usar como **Mock Server**.

---

## Propuesta de módulo Pacientes y Turnos (mockup)

La propuesta técnica para los nuevos recursos **`/pacientes`** y **`/turnos-medicos`** está documentada en el archivo [`pacientes-turnos.md`](./pacientes-turnos.md) de la raíz del repositorio. Incluye:

- Modelado conceptual de ambas entidades.
- Interfaces TypeScript propuestas.
- Definición de los nuevos endpoints REST (métodos, paths, body, códigos).
- Reglas de negocio.
- Impacto en la estructura de carpetas Clean Architecture.

---

## Uso de Inteligencia Artificial

Durante el desarrollo de este proyecto se utilizó Claude (Anthropic) como asistente de código. Los principales usos:

| Tarea | Herramienta | Prompt | Respuesta generada | Ajuste manual |
| --- | --- | --- | --- | --- |
| Arquitectura en capas en inglés | Claude | "Armá un backend TypeScript con routes/controllers/services/schemas/models para Turno y Medico." | Esqueleto completo con ESM. | Ajuste de extensiones `.js` en imports. |
| Schemas Zod | Claude | "Armá schemas Zod con especialidades en Title Case (Clínica médica, etc.)." | Zod con `.enum`, `.regex` y mensajes en español. | Mapeo PascalCase → interno. |
| Middleware de errores | Claude | "Necesito un middleware Express que capture ZodError y AppError y devuelva {status, message, code, details}." | Implementación con `instanceof`. | Agregado `notFoundController` y logs. |
| Refactor a controllers async | Claude | "Refactorizá los controllers a async con status dinámico, validaciones previas con throw AppError y return explícito." | Controllers con try/catch, `let status`, `throw new AppError`, `return res.status().json()`. | Ajuste del status en el bloque catch del POST (400 por defecto). |
| Documentación README y mockup | Claude | "Generá el markdown del README y del pacientes-turnos.md documentando endpoints con método, path, body y códigos." | Markdown con tablas, bloques typescript/json y navegación. | Revisión de ejemplos de JSON y traducción al dominio real. |
| Colección Postman | Claude | "Armá la collection v2.1.0 con variables baseUrl, scripts de test y escenarios happy/unhappy." | JSON válido con `pm.test` y `collectionVariables.set`. | Ajuste de encadenamiento POST→PUT→DELETE con IDs dinámicos. |

**Reflexión personal**: la IA aceleró significativamente el scaffolding, la escritura de boilerplate y la documentación. El valor humano estuvo en definir la arquitectura, validar coherencia entre capas, revisar casos borde (fechas en distintos formatos, especialidades con/sin tildes) y asegurar la integración con el código previo.

---

## Autora

**María Soledad Lovero** – Materia Integraciones Web – Octubre 2026.
