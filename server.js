require("dotenv").config();
// const { createClient } = require("@supabase/supabase-js")
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const OpenAI = require("openai");
const path = require("path");
const { z } = require("zod");
const { zodResponseFormat } = require("openai/helpers/zod");

const { Paciente, Medico, Informe, HistoriaClinica } = require("./classes.js");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const baseUrl = "https://api.openai.com/v1";
const baseServerBackend = "https://rene-app-backend-production.up.railway.app"

const API_KEY = process.env.OPENAI_API_KEY;

startServer();

function initializeServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // const supabaseUrl = "https://mahbchopvbpcjbcfhjhc.supabase.co";
  // const supabaseKey = process.env.SUPABASE_KEY;
  // const supabase = createClient(supabaseUrl, supabaseKey);

  // // Check if Supabase connection is successful
  // const checkSupabaseConnection = async () => {
  //   try {
  //     const { data, error } = await supabase.from('informe').select('count', { count: 'exact' });
  //     if (error) throw error;
  //     console.log('Successfully connected to Supabase');
  //   } catch (error) {
  //     console.error('Error connecting to Supabase:', error.message);
  //     process.exit(1); // Exit if connection fails
  //   }
  // };

  // // Initialize connection check
  // checkSupabaseConnection();

  app.use(express.json());

  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

  // Create uploads directory if it doesn't exist
  if (!fs.existsSync("uploads/")) {
    fs.mkdirSync("uploads/");
  }

  const upload = multer({ storage: storage });

  // Route config
  app.get("/saludo", (req, res) => {
    res.json({ mensaje: "¡Hola desde la API en Glitch!" });
  });

  // New audio transcription endpoint
  app.post("/audio", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se proporcionó ningún archivo de audio" });
      }

      const audioFilePath = req.file.path;

      // Create a new FormData instance
      const formData = new FormData();
      formData.append("model", "gpt-4o-mini-transcribe");
      formData.append("file", fs.createReadStream(audioFilePath));

      // Make the request to OpenAI API
      const response = await axios.post(
        `${baseUrl}/audio/transcriptions`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            "Authorization": `Bearer ${API_KEY}`
          }
        }
      );

      // Clean up - delete the file after processing
      fs.unlinkSync(audioFilePath);

      // Return the transcription response
      return res.json(response.data);
    } catch (error) {
      console.error("Error en la transcripción:", error.response?.data || error.message);
      return res.status(500).json({
        error: "Error al procesar la transcripción",
        details: error.response?.data || error.message
      });
    }
  });

  // Debe recibir lo procesado de voz a texto (ya masticado)
  app.post("/process", async (req, res) => {
    const text = req.body.text || "Por favor, realiza una   .";

    responseContent = await getLLMResponse(
      getFullPrompt(text)
    );

    console.log("Respuesta: ", responseContent);

    res.json(responseContent)
  });

  // Nuevo endpoint que procesa el archivo: primero lo envía a /audio y luego al endpoint /process
  app.post("/process-all", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se proporcionó ningún archivo de audio" });
      }

      const audioFilePath = req.file.path;
      const formData = new FormData();
      formData.append("model", "gpt-4o-mini-transcribe");
      formData.append("file", fs.createReadStream(audioFilePath));

      // Llamar al endpoint /audio
      const audioResponse = await axios.post(
        `${baseServerBackend}/audio`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            "Authorization": `Bearer ${API_KEY}`
          }
        }
      );

      // Extraer el texto de la transcripción, asumiendo que viene en audioResponse.data.text
      const transcriptionText = audioResponse.data.text || audioResponse.data;

      console.log("Texto de la transcripción:\n{'", transcriptionText, "'}");

      // Llamar al endpoint /process con el texto obtenido
      const processResponse = await axios.post(
        `${baseServerBackend}/process`,
        { text: transcriptionText },
        { headers: { "Content-Type": "application/json" } }
      );

      // En su lugar, simplemente devolvemos la respuesta del procesamiento
      return res.json(processResponse.data);

    } catch (error) {
      console.error("Error en el endpoint /process-all:", error.response?.data || error.message);
      return res.status(500).json({
        error: "Error al procesar el audio",
        details: error.response?.data || error.message
      });
    }
  });

  app.post("/validate_history", async (req, res) => {
    // const { data, error } = await supabase
    //   .from("informe")
    //   .update([{  // Note the array syntax
    //     informe: req.body[0].informe,
    //     seguimiento: req.body[0].seguimiento,
    //     fecha: req.body[0].fecha,
    //     receta: req.body[0].receta,
    //     solicitudes: req.body[0].solicitudes,
    //     diagnostico_medico: req.body[0].diagnostico_medico,
    //     diagnostico_predictivo: req.body[0].diagnostico_predictivo
    //   }])
    //   .eq("id", req.body[0].id)

    // if (error) {
    //   console.error("Error al actualizar el informe en la base de datos:", error);
    //   return res.status(500).json({ error: "Error al procesar el audio" });
    // }
    // else {
    //   console.log("Informe actualizado con éxito en la base de datos");
    //   return res.status(204).send();
    // }

    // Temporalmente, solo devolvemos una respuesta exitosa
    return res.status(204).send();
  });



  return { app, PORT };
}

function startServer() {
  const { app, PORT } = initializeServer();

  app.listen(PORT, () => {
    console.log(`Servidor de transcripción de audio iniciado`);
  });
}


function determineAction(prompt) {
  const lowerPrompt = prompt.toLowerCase();

  if (
    lowerPrompt.includes("resumir") ||
    lowerPrompt.includes("historia clínica")
  ) {
    return "resumir_historia";
  } else if (lowerPrompt.includes("receta")) {
    return "generar_receta";
  } else if (lowerPrompt.includes("informe")) {
    return "anadir_informe_a_historia";
  } else {
    return "entender_contexto";
  }
}
async function getLLMResponse(prompt) {
  try {

    const Step = z.object({
      explanation: z.string(),
      output: z.string(),
    });

    const MathReasoning = z.object({
      steps: z.array(Step),
      final_answer: z.string(),
    });

    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: prompt }
      ],
      response_format: zodResponseFormat(Informe, "informe"),
    });

    const informe = response.choices[0].message

    // If the model refuses to respond, you will get a refusal message
    if (informe.refusal) {
      console.log(informe.refusal);
      return;
    }

    return informe.parsed;

  } catch (error) {
    console.error(
      "Error en la API:",
      error.response ? error.response.data : error.message
    );
    return "Error al procesar la solicitud.";
  }
}

function getFullPrompt(transcribedText) {
  return `Eres un experto en procesamiento de lenguaje natural especializado en transcripciones médicas. Recibirás un texto transcrito de un audio de un médico en el que se detalla el estado y análisis médico del paciente, abarcando tanto su situación actual como pasada. El texto puede incluir información sobre diagnóstico, seguimiento, solicitudes (estudios, turnos, derivaciones u otro tipo de requerimientos) y/o prescripciones de medicamentos o tratamientos (al menos uno de estos estará presente), entre otras cosas.

Tu tarea es:
1. Identificar y clasificar la información contenida en el texto sin modificar, eliminar o corregir ninguna parte del input. SOLO puedes quitar muletillas y palabras repetidas o cortadas.
2. Analizar y diseccionar la información para diferenciar claramente entre:
   - "informe": Información general que refleje el estado del paciente y el análisis médico (incluyendo diagnóstico, seguimiento y antecedentes), así como el análisis o resultados de estudios ya realizados.
   - "solicitudes": Si el médico solicita la realización de estudios, turnos, derivaciones u otro tipo de requerimientos, extrae esa parte íntegramente y colócala en esta sección, manteniendo la redacción y sintaxis original.
   - "recetas": Si el médico prescribe medicamentos o tratamientos, extrae esa información y colócala en esta sección, respetando fielmente las palabras y la gramática del médico.
   - "diagnostico_medico": Extrae la información correspondiente a cualquier diagnóstico mencionado por el médico, ya sea diagnóstico final, preventivo, diferencial o de cualquier otro tipo.
   - "diagnostico_predictivo": Utilizando todo el texto de input, realiza una predicción del diagnóstico basada en la información proporcionada. Quiero que digas 3 posibles enfermedades con una muy breve justificacion del por que.
3. Dejar como strings vacios en el JSOn aquellos campos que no deban ser cargados.

Fecha de hoy: ${new Date().toISOString().split("T")[0]}

Texto en cuestión: [${transcribedText}]

`
}
