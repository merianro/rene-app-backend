const PDFDocument = require("pdfkit");
const fs = require("fs");
const bwipjs = require("bwip-js");

// Función para generar un PDF
async function generateReceta(fileName, data) {
  const doc = new PDFDocument();
  const filePath = `./${fileName}`;
  doc.pipe(fs.createWriteStream(filePath));

  // Encabezado
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("IPSST (Inst. Seg. Soc. de Tucumán)", { align: "center" });
  doc.moveDown();

  // Información de la prescripción
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Prescripción", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).font("Helvetica").text(`Fecha Receta: ${data.fecha}`);
  doc.text(`Afiliado: ${data.afiliado}`);
  doc.text(`D.N.I.: ${data.dni}`);
  doc.text(`Diagnóstico: ${data.diagnostico}`);
  doc.text(`T. Prolongado: ${data.tProlongado}`);
  doc.text(`Plan: ${data.plan}`);
  doc.moveDown();

  // Productos recetados
  doc.fontSize(12).font("Helvetica-Bold").text("Productos:");
  data.productos.forEach((producto, index) => {
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`${index + 1}. ${producto.nombre}`);
    doc.text(`   Cantidad: ${producto.cantidad}`);
    doc.text(`   Cobertura: ${producto.cobertura}`);
    doc.moveDown();
  });

  // Código de barras
  doc.fontSize(12).font("Helvetica-Bold").text("Recetario:");
  const barcodeBuffer = await generateBarcode(data.recetario);
  doc.image(barcodeBuffer, { width: 150, align: "center" });
  doc.moveDown();
  doc.moveDown();
  doc.moveDown();
  doc.moveDown();
  doc.moveDown();
  doc.moveDown();

  // Información del médico
  doc.text(`Médico: ${data.medico}`);
  doc.text(`Matrícula: ${data.matricula}`);
  

  // Observaciones
  if (data.observaciones) {
    doc.fontSize(12).font("Helvetica-Bold").text("Observaciones:");
    doc.fontSize(12).font("Helvetica").text(data.observaciones);
    doc.moveDown();
  }

  // QR de validación digital
  doc.fontSize(12).font("Helvetica-Bold").text("Validación Digital:");
  doc.image("qr.png", { width: 80, align: "center" });

  doc.end();
  return filePath;
}

// Función para generar un código de barras
async function generateBarcode(text) {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: "code128", // Tipo de código de barras
        text: text,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: "center",
      },
      (err, png) => {
        if (err) reject(err);
        else resolve(png);
      }
    );
  });
}

async function generateReportToHistory(data, fileName) {
  const doc = new PDFDocument();
  const filePath = `./${fileName}`;
  doc.pipe(fs.createWriteStream(filePath));

  // Encabezado del reporte
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .text("Reporte para Historia Clínica", { align: "center" });
  doc.moveDown();

  // Fecha del reporte
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(`Fecha: ${data.fecha || "____________________"}`);
  doc.moveDown();

  // Información del paciente
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Información del Paciente:");
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(`Nombre: ${data.name || "____________________"}`);
  doc.text(`DNI: ${data.dni || "____________________"}`);
  doc.text(`Afiliado: ${data.affiliate || "____________________"}`);
  doc.moveDown();

  // Diagnóstico detallado
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Diagnóstico Detallado:");
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(data.diagnostico || "____________________");
  doc.moveDown();

  // Notas adicionales
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Notas Adicionales:");
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(data.notas || "____________________");
  doc.moveDown();

  // Tratamiento o recomendaciones
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Tratamiento/Recomendaciones:");
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(data.tratamiento || "____________________");
  doc.moveDown();

  // Línea separadora
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // QR fijo (puedes usar una imagen de QR)
  const qrPath = "./qr.png"; // Ruta a una imagen QR fija
  if (fs.existsSync(qrPath)) {
    doc.image(qrPath, { fit: [100, 100], align: "center" });
  } else {
    doc.text("QR aquí (imagen no encontrada)", { align: "center" });
  }

  // Firma del médico
  doc.moveDown();
  doc.text("____________________", { align: "right" });
  doc.text("Firma del Médico", { align: "right" });

  doc.end();
  return filePath;
}

module.exports = {
  generateReceta,
  generateBarcode,
  generateReportToHistory,
};
