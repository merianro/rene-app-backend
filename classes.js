const Paciente = z.object({
    dni: z.string().max(20), // PRIMARY KEY
    nombre: z.string().max(100), // NOT NULL
    apellido: z.string().max(100), // NOT NULL
    sexo: z.enum(['masculino', 'femenino', 'otro']), // CHECK constraint
    fdn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Fecha de nacimiento (DATE in SQL)
    nro_afiliado: z.string().max(50).nullable(), // UNIQUE NULL
    email: z.string().email().max(255), // UNIQUE NOT NULL
    celular: z.string().max(20), // UNIQUE NOT NULL
});

const Medico = z.object({
    dni: z.string().max(20), // PRIMARY KEY
    nombre: z.string().max(100), // NOT NULL
    apellido: z.string().max(100), // NOT NULL
    matricula: z.string().max(50), // UNIQUE NOT NULL
    especialidad: z.string().max(50).nullable(), // NULL
});

const Informe = z.object({
    id: z.number().int(), // SERIAL PRIMARY KEY
    contenido: z.string().nullable(), // TEXT NULL
    seguimiento: z.string().nullable(), // TEXT NULL
    fecha: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3}Z)?$/)
        .default(() => new Date().toISOString()), // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    dni_medico: z.string().max(20).nullable(), // REFERENCES Medico(dni) ON DELETE SET NULL
    receta: z.string().nullable(), // TEXT NULL
    dni_paciente: z.string().max(20), // REFERENCES Paciente(dni) ON DELETE CASCADE
    autorizacion_estudio: z.string().nullable(), // TEXT NULL
});

const HistoriaClinica = z.object({
    id: z.number().int(), // SERIAL PRIMARY KEY
    dni_paciente: z.string().max(20), // REFERENCES Paciente(dni) ON DELETE CASCADE
    id_informe: z.number().int(), // REFERENCES Informe(id) ON DELETE CASCADE
});
