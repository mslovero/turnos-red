# Módulo Pacientes y Turnos Médicos — Propuesta técnica

> **Documento mockup / propuesta funcional** para el equipo de Frontend.
> Describe el modelado conceptual de dos nuevas entidades (**Paciente** y **TurnoMédico**)
> y los endpoints REST que las expondrán, siguiendo los principios de **Clean Architecture**
> aplicados al proyecto **TurnosRed**.

---

## 1. Contexto

El módulo actual de `/turnos` representa una **cita bibliográfica/administrativa** importada desde los JSON heterogéneos de las sedes. El equipo de Frontend necesita avanzar con la **pantalla de gestión de pacientes y asignación de turnos médicos**, lo que requiere dos entidades nuevas y mejor modeladas:

- **Paciente** → ciudadano registrado que puede recibir atención.
- **TurnoMédico** → cita que vincula a un **Paciente** con un **Médico** en una fecha y hora.

Estas entidades conviven con el recurso `/turnos` legado (que seguirá disponible hasta que la migración se complete) y con `/medicos` (ya existente).

---

## 2. Entidad Paciente

### 2.1 Datos mínimos indispensables

| Campo | Tipo | Obligatorio | Descripción |
| --- | --- | :---: | --- |
| `id` | `number` | sí (autogenerado) | Identificador único del paciente. |
| `dni` | `string` | sí | Documento Nacional de Identidad. Solo dígitos. |
| `nombre` | `string` | sí | Nombre del paciente. |
| `apellido` | `string` | sí | Apellido del paciente. |
| `fechaNacimiento` | `string` (ISO `YYYY-MM-DD`) | sí | Fecha de nacimiento. |
| `email` | `string` | sí | Correo de contacto. |
| `telefono` | `string` | sí | Teléfono de contacto. |
| `obraSocial` | `string` | no | Nombre de la obra social (si corresponde). |
| `numeroAfiliado` | `string` | no | Número de afiliado a la obra social. |
| `observaciones` | `string` | no | Notas médicas o administrativas. |
| `activo` | `boolean` | sí | Baja lógica (default `true`). |

### 2.2 Interfaz TypeScript propuesta

```typescript
export interface Paciente {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string; // YYYY-MM-DD
  email: string;
  telefono: string;
  obraSocial?: string;
  numeroAfiliado?: string;
  observaciones?: string;
  activo: boolean;
}

export type PacienteInput = Omit<Paciente, 'id' | 'activo'>;
export type PacienteUpdate = Partial<Omit<Paciente, 'id'>>;
```

### 2.3 Ejemplo JSON

```json
{
  "id": 1,
  "dni": "32456789",
  "nombre": "Lucía",
  "apellido": "Martínez",
  "fechaNacimiento": "1992-04-15",
  "email": "lucia.martinez@mail.com",
  "telefono": "+54 11 5555-1111",
  "obraSocial": "OSDE",
  "numeroAfiliado": "123-456-7890",
  "activo": true
}
```

---

## 3. Entidad TurnoMédico

### 3.1 Datos mínimos indispensables

| Campo | Tipo | Obligatorio | Descripción |
| --- | --- | :---: | --- |
| `id` | `number` | sí (autogenerado) | Identificador único del turno. |
| `pacienteId` | `number` | sí | FK a `Paciente`. |
| `medicoId` | `number` | sí | FK a `Medico`. |
| `especialidad` | `string` (enum) | sí | Clínica médica / Pediatría / Odontología / Nutrición. |
| `fecha` | `string` (ISO `YYYY-MM-DD`) | sí | Día del turno. |
| `hora` | `string` (`HH:MM`) | sí | Hora del turno. |
| `estado` | `string` (enum) | sí | `pendiente` \| `confirmado` \| `cancelado` \| `atendido`. |
| `motivo` | `string` | no | Motivo de consulta. |
| `observaciones` | `string` | no | Notas del médico o del administrativo. |
| `creadoEn` | `string` (ISO datetime) | sí (autogenerado) | Timestamp de alta. |

### 3.2 Interfaz TypeScript propuesta

```typescript
export type EstadoTurno = 'pendiente' | 'confirmado' | 'cancelado' | 'atendido';

export interface TurnoMedico {
  id: number;
  pacienteId: number;
  medicoId: number;
  especialidad: 'Clínica médica' | 'Pediatría' | 'Odontología' | 'Nutrición';
  fecha: string;   // YYYY-MM-DD
  hora: string;    // HH:MM
  estado: EstadoTurno;
  motivo?: string;
  observaciones?: string;
  creadoEn: string; // ISO datetime
}

export type TurnoMedicoInput = Omit<TurnoMedico, 'id' | 'creadoEn' | 'estado'> & {
  estado?: EstadoTurno;
};
export type TurnoMedicoUpdate = Partial<Omit<TurnoMedico, 'id' | 'creadoEn'>>;
```

### 3.3 Ejemplo JSON

```json
{
  "id": 1,
  "pacienteId": 1,
  "medicoId": 2,
  "especialidad": "Clínica médica",
  "fecha": "2026-11-20",
  "hora": "09:30",
  "estado": "pendiente",
  "motivo": "Control anual",
  "creadoEn": "2026-10-04T20:30:00.000Z"
}
```

---

## 4. Endpoints propuestos

Siguiendo la arquitectura en capas del proyecto (`routes` → `controllers` → `services` → `schemas` → `models`), los dos nuevos recursos se exponen bajo rutas separadas.

### 4.1 Recurso `/pacientes`

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/pacientes` | Lista pacientes activos. Admite filtros `?dni=`, `?apellido=`, `?activo=`. | 200 |
| GET | `/pacientes/:id` | Obtiene un paciente por id. | 200, 400, 404 |
| POST | `/pacientes` | Registra un nuevo paciente. | 201, 400 |
| PUT | `/pacientes/:id` | Actualiza un paciente existente. | 200, 400, 404 |
| DELETE | `/pacientes/:id` | Baja lógica (setea `activo: false`). | 204, 400, 404 |

**Ejemplo — POST /pacientes**

```http
POST {{baseUrl}}/pacientes
Content-Type: application/json
```

```json
{
  "dni": "32456789",
  "nombre": "Lucía",
  "apellido": "Martínez",
  "fechaNacimiento": "1992-04-15",
  "email": "lucia.martinez@mail.com",
  "telefono": "+54 11 5555-1111",
  "obraSocial": "OSDE"
}
```

Respuesta `201 Created`:

```json
{
  "id": 1,
  "dni": "32456789",
  "nombre": "Lucía",
  "apellido": "Martínez",
  "fechaNacimiento": "1992-04-15",
  "email": "lucia.martinez@mail.com",
  "telefono": "+54 11 5555-1111",
  "obraSocial": "OSDE",
  "activo": true
}
```

### 4.2 Recurso `/turnos-medicos`

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/turnos-medicos` | Lista turnos. Filtros: `?pacienteId=`, `?medicoId=`, `?fecha=`, `?estado=`. | 200 |
| GET | `/turnos-medicos/:id` | Obtiene un turno por id. | 200, 400, 404 |
| POST | `/turnos-medicos` | Asigna un nuevo turno. | 201, 400 |
| PUT | `/turnos-medicos/:id` | Actualiza datos del turno (reprogramación, observaciones, etc.). | 200, 400, 404 |
| PATCH | `/turnos-medicos/:id/estado` | Cambia el estado del turno (confirmar, cancelar, marcar atendido). | 200, 400, 404 |
| DELETE | `/turnos-medicos/:id` | Elimina el turno. | 204, 400, 404 |

**Ejemplo — POST /turnos-medicos**

```http
POST {{baseUrl}}/turnos-medicos
Content-Type: application/json
```

```json
{
  "pacienteId": 1,
  "medicoId": 2,
  "especialidad": "Clínica médica",
  "fecha": "2026-11-20",
  "hora": "09:30",
  "motivo": "Control anual"
}
```

Respuesta `201 Created`:

```json
{
  "id": 1,
  "pacienteId": 1,
  "medicoId": 2,
  "especialidad": "Clínica médica",
  "fecha": "2026-11-20",
  "hora": "09:30",
  "estado": "pendiente",
  "motivo": "Control anual",
  "creadoEn": "2026-10-04T20:30:00.000Z"
}
```

**Ejemplo — PATCH /turnos-medicos/:id/estado**

```http
PATCH {{baseUrl}}/turnos-medicos/1/estado
Content-Type: application/json
```

```json
{ "estado": "confirmado" }
```

---

## 5. Reglas de negocio relevantes

1. No se pueden registrar dos pacientes con el **mismo DNI**.
2. No se puede asignar un turno a un **médico con `disponible: false`**.
3. No se puede asignar un turno a un **paciente con `activo: false`**.
4. La **especialidad** del turno debe coincidir con la especialidad del médico asignado.
5. No se permiten dos turnos simultáneos (mismo médico, misma fecha y misma hora).
6. Un turno con estado `atendido` no puede re-abrirse (solo lectura).

---

## 6. Formato estándar de errores

Todas las respuestas de error siguen el mismo contrato que ya utiliza la API:

```json
{
  "status": 400,
  "message": "Error de validación en los datos ingresados",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "dni", "message": "El DNI debe contener solo dígitos.", "code": "invalid_format" }
  ]
}
```

Códigos esperados: `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `CONFLICT` (409 — DNI duplicado o superposición de turnos), `INVALID_ID` (400), `BUSINESS_RULE_VIOLATION` (422 — médico no disponible, especialidad incorrecta).

---

## 7. Impacto en Clean Architecture

Los nuevos recursos se incorporan respetando la misma estructura en inglés que el resto del proyecto:

```
src/
├── controllers/
│   ├── pacientes.controller.ts     (nuevo)
│   └── turnosMedicos.controller.ts (nuevo)
├── models/
│   ├── paciente.model.ts           (nuevo)
│   └── turnoMedico.model.ts        (nuevo)
├── routes/
│   ├── pacientes.routes.ts         (nuevo)
│   └── turnosMedicos.routes.ts     (nuevo)
├── schemas/
│   ├── paciente.schema.ts          (nuevo)
│   └── turnoMedico.schema.ts       (nuevo)
└── services/
    ├── pacientes.service.ts        (nuevo)
    └── turnosMedicos.service.ts    (nuevo)
```

Cada controller mantendrá:
- **Firma `async (req, res, next): Promise<Response | void>`**
- **Variable `status` dinámica**
- **Validaciones previas con `throw new AppError(...)`**
- **`return` explícito en cada `res.status().json()`**
- **Bloque `try/catch` envolviendo la lógica**

---

**Autora**: María Soledad Lovero
**Fecha**: 03/10/2026
**Proyecto**: TurnosRed – Materia Integraciones Web
