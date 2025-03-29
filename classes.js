import { z } from 'zod';

export const Paciente = z.object({
    dni: z.string(), // PRIMARY KEY
    nombre: z.string().max(100), // NOT NULL
    apellido: z.string().max(100), // NOT NULL
    sexo: z.enum(['masculino', 'femenino', 'otro']), // CHECK export constraint
    fdn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Fecha de nacimiento (DATE in SQL)
    nro_afiliado: z.string().max(50).nullable(), // UNIQUE NULL
    email: z.string().email().max(255), // UNIQUE NOT NULL
    celular: z.string(), // UNIQUE NOT NULL
});

export const Medico = z.object({
    dni: z.string(), // PRIMARY KEY
    nombre: z.string().max(100), // NOT NULL
    apellido: z.string().max(100), // NOT NULL
    matricula: z.string().max(50), // UNIQUE NOT NULL
    especialidad: z.string().max(50).nullable(), // NULL
});

export const Informe = z.object({
    id: z.number().int(), // SERIAL PRIMARY KEY
    informe: z.string().nullable(), // TEXT NULL
    seguimiento: z.string().nullable(), // TEXT NULL
    fecha: z.string(), // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    receta: z.string().nullable(), // TEXT NULL
    solicitudes: z.string().nullable(), // TEXT NULL
    diagnostico_medico: z.string().nullable(), // TEXT NULL
    diagnostico_predictivo: z.string().nullable(), // TEXT NULL
});

export const HistoriaClinica = z.object({
    id: z.number().int(), // SERIAL PRIMARY KEY
    dni_paciente: z.string(), // REFERENCES Paciente(dni) ON DELETE CASCADE
    id_informe: z.number().int(), // REFERENCES Informe(id) ON DELETE CASCADE
});


export const Full_Format = z.object({
    id: z.number().int(), // SERIAL PRIMARY KEY
    contenido: z.string().nullable(), // TEXT NULL
    seguimiento: z.string().nullable(), // TEXT NULL
    fecha: z.string(), // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    dni_medico: z.string().nullable(), // REFERENCES Medico(dni) ON DELETE SET NULL
    receta: z.string().nullable(), // TEXT NULL
    dni_paciente: z.string(), // REFERENCES Paciente(dni) ON DELETE CASCADE
    estudio: z.string().nullable(), // TEXT NULL
});
