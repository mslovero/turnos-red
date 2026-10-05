import type { Medico, MedicoInput, MedicoUpdate, FiltroMedicos } from '../schemas/medico.schema.js';

class MedicosService {
  private medicos: Medico[] = [];
  private siguienteId = 1;

  cargarInicial(medicos: Medico[]): void {
    this.medicos = [...medicos];
    this.siguienteId = this.medicos.reduce((max, m) => Math.max(max, m.id), 0) + 1;
  }

  listar(filtros: FiltroMedicos = {}): Medico[] {
    return this.medicos.filter((m) => {
      if (filtros.especialidad && m.especialidad !== filtros.especialidad) return false;
      if (filtros.disponible !== undefined && m.disponible !== filtros.disponible) return false;
      return true;
    });
  }

  obtenerPorId(id: number): Medico | undefined {
    return this.medicos.find((m) => m.id === id);
  }

  crear(nuevo: MedicoInput): Medico {
    const medico: Medico = { id: this.siguienteId++, ...nuevo };
    this.medicos.push(medico);
    return medico;
  }

  actualizar(id: number, cambios: MedicoUpdate): Medico | null {
    const idx = this.medicos.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    const actualizado: Medico = { ...this.medicos[idx], ...cambios, id };
    this.medicos[idx] = actualizado;
    return actualizado;
  }

  eliminar(id: number): boolean {
    const idx = this.medicos.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    this.medicos.splice(idx, 1);
    return true;
  }
}

export const medicosService = new MedicosService();

// Datos semilla iniciales
medicosService.cargarInicial([
  {
    id: 1,
    nombre: 'Carolina',
    apellido: 'Alvarez',
    matricula: 'MP-12345',
    documento: '27456123',
    especialidad: 'Pediatría',
    disponible: true,
    email: 'calvarez@turnosred.com',
  },
  {
    id: 2,
    nombre: 'Martín',
    apellido: 'Gutiérrez',
    matricula: 'MP-23456',
    documento: '28567234',
    especialidad: 'Clínica médica',
    disponible: true,
    email: 'mgutierrez@turnosred.com',
  },
  {
    id: 3,
    nombre: 'Lucía',
    apellido: 'Fernández',
    matricula: 'MP-34567',
    documento: '29678345',
    especialidad: 'Odontología',
    disponible: false,
    email: 'lfernandez@turnosred.com',
  },
  {
    id: 4,
    nombre: 'Pablo',
    apellido: 'Rodríguez',
    matricula: 'MP-45678',
    documento: '30789456',
    especialidad: 'Nutrición',
    disponible: true,
  },
]);
