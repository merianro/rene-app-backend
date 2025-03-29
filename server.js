require("dotenv").config();
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const baseUrl = "https://rene-app-backend-production.up.railway.app";
const API_KEY = process.env.OPENAI_API_KEY;

startServer();

function initializeServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function(req, file, cb) {
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

      console.log("Transcripción recibida:", response.data);
      
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
  app.post("/procesar", async (req, res) => {
    console.log("Body del req:", req.body);
    const text = req.body.text || "Por favor, realiza una acción.";

    responseContent = await getDeepSeekResponse(
      getFullPrompt(text)
    );

    res.json(responseContent[0].text)
  });

  return { app, PORT };
}

function startServer() {
  const { app, PORT } = initializeServer();

  app.listen(PORT, () => {
    console.log(`Servidor de transcripción de audio iniciado en http://localhost:${PORT}`);
    console.log(`Prueba el endpoint de transcripción en: http://localhost:${PORT}/audio`);
  });
}


function determineAction(prompt) {
  const lowerPrompt = prompt.toLowerCase();

  if (
    lowerPrompt.includes("resumir") ||
    lowerPrompt.includes("historia clínica")
  ) {
    return "resumir_historia";
  } else if (lowerPrompt.includes("receta")){
    return "generar_receta";
  } else if (lowerPrompt.includes("informe")) {
    return "anadir_informe_a_historia";
  } else {
    return "entender_contexto";
  }
}

async function getDeepSeekResponse(prompt) {
  try {
    const response = await axios.post(
      `${baseUrl}/responses`,
      {
        model: "gpt-4o-mini", // deepseek/deepseek-r1:free ,,, Modelo de DeepSeek en OpenRouter
        input: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data.output[0].content);

    return response.data.output[0].content;

  } catch (error) {
    console.error(
      "Error en la API:",
      error.response ? error.response.data : error.message
    );
    return "Error al procesar la solicitud.";
  }
}

function getFullPrompt(transcribedText) {

  return `Eres un experto en procesamiento de lenguaje natural especializado en transcripciones médicas. Recibirás un texto transcrito a partir de un audio de un médico y debes limpiar y estructurar la información en formato JSON. Sigue estas reglas estrictamente. Elimina muletillas y pausas innecesarias, como 'eee', 'ehh' y otras expresiones vacías. Filtra y elimina comentarios irrelevantes que no formen parte de la historia clínica, como referencias al clima, compras o temas personales del médico. Elimina palabras repetidas que no aporten valor al texto. Corrige errores gramaticales para mejorar la claridad del contenido. No elimines frases médicas, incluso si parecen inconexas; solo límpialas. Devuelve la información en formato JSON, con los siguientes campos:  Nombre: Nombre del paciente,  Apellido: Apellido del paciente,  DNI: Número de DNI,  Diagnostico: Texto limpio y corregido del diagnostico. Asegúrate de mantener el significado original del contenido médico sin agregar ni inventar información. Devuelve solo el JSON como respuesta, sin texto adicional. Este es el texto en cuestion:[${transcribedText}]`
}