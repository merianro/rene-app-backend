const {
  getPacientes,
  addPaciente,
  getInformes,
  addInforme,
  getHistoriasClinicas,
  addHistoriaClinica,
  getMedicos,
  addMedico,
} = require("./supabaseManager");

async function test() {
  try {
    // Prueba agregar un paciente
    const newPaciente = {
      dni: "12345678",
      nombre: "Juan",
      apellido: "Pérez",
      sexo: "masculino", // Actualizado para usar el enum
      fdn: "1990-01-01", // Fecha de nacimiento
      nro_afiliado: null, // Ahora puede ser nulo
      email: "juan.perez@example.com",
      celular: "123456789",
    };
    console.log("Adding paciente:", await addPaciente(newPaciente));

    // Prueba obtener pacientes
    console.log("Pacientes:", await getPacientes());

    // Prueba agregar un médico
    const newMedico = {
      dni: "87654321",
      nombre: "Ana",
      apellido: "Gómez",
      matricula: "MAT12345",
      especialidad: null, // Ahora puede ser nulo
    };
    console.log("Adding medico:", await addMedico(newMedico));

    // Prueba obtener médicos
    console.log("Médicos:", await getMedicos());

    // Prueba agregar un informe
    const newInforme = {
      contenido: null, // Ahora puede ser nulo
      seguimiento: null, // Ahora puede ser nulo
      fecha: new Date().toISOString(), // Fecha actual por defecto
      dni_medico: "87654321", // Debe coincidir con un médico existente
      receta: null, // Ahora puede ser nulo
      dni_paciente: "12345678", // Debe coincidir con un paciente existente
      autorizacion_estudio: null, // Ahora puede ser nulo
    };
    console.log("Adding informe:", await addInforme(newInforme));

    // Prueba obtener informes
    console.log("Informes:", await getInformes());

    // Prueba agregar una historia clínica
    const newHistoriaClinica = {
      dni_paciente: "12345678", // Debe coincidir con un paciente existente
      id_informe: 1, // Asegúrate de que exista un informe con este ID
    };
    console.log("Adding historia clinica:", await addHistoriaClinica(newHistoriaClinica));

    // Prueba obtener historias clínicas
    console.log("Historias Clínicas:", await getHistoriasClinicas());
  } catch (error) {
    console.error("Error:", error.message);
  }
}

test();
