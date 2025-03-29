const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Paciente
async function getPacientes() {
  const { data, error } = await supabase.from("paciente").select("*");
  if (error) throw error;
  return data;
}

async function addPaciente(paciente) {
  const { data, error } = await supabase.from("paciente").insert([paciente]);
  if (error) throw error;
  return data;
}

// Informe
async function getInformes() {
  const { data, error } = await supabase.from("informe").select("*");
  if (error) throw error;
  return data;
}

async function addInforme(informe) {
  const { data, error } = await supabase.from("informe").insert([informe]);
  if (error) throw error;
  return data;
}

// HistoriaClinica
async function getHistoriasClinicas() {
  const { data, error } = await supabase.from("historia_clinica").select("*");
  if (error) throw error;
  return data;
}

async function addHistoriaClinica(historiaClinica) {
  const { data, error } = await supabase.from("historia_clinica").insert([historiaClinica]);
  if (error) throw error;
  return data;
}

// Medico
async function getMedicos() {
  const { data, error } = await supabase.from("medico").select("*");
  if (error) throw error;
  return data;
}

async function addMedico(medico) {
  const { data, error } = await supabase.from("medico").insert([medico]);
  if (error) throw error;
  return data;
}

module.exports = {
  getPacientes,
  addPaciente,
  getInformes,
  addInforme,
  getHistoriasClinicas,
  addHistoriaClinica,
  getMedicos,
  addMedico,
};