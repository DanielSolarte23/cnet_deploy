const db = require("../models");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  // Configurar según tu proveedor de email
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Función para generar token de confirmación
const generateConfirmationToken = (entregaId) => {
  const payload = `${entregaId}-${Date.now()}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
};

// Función para crear el template del email
const createEmailTemplate = (entrega, confirmationUrl, accion = "creada") => {
  const productos = entrega.EntregaProductos || [];

  const productosHtml = productos
    .map((ep) => {
      const seriadas =
        Array.isArray(ep.unidadesSeriadasDetalle) &&
        ep.unidadesSeriadasDetalle.length > 0
          ? ` (Unidades seriadas: ${ep.unidadesSeriadasDetalle
              .map((s) => s.serial)
              .join(", ")})`
          : "";
      return `<li>${ep.descripcion} - Cantidad: ${ep.cantidad}${seriadas}</li>`;
    })
    .join("");

  const fechaEntrega = new Date(entrega.fecha).toLocaleDateString();
  const fechaDevolucion = entrega.fechaEstimadaDevolucion
    ? new Date(entrega.fechaEstimadaDevolucion).toLocaleDateString()
    : "No especificada";

  return `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Confirmación de Entrega - ${entrega.proyecto}</title>
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
  backend/uploads    line-height: 1.6; 
      color: #e2e8f0; 
      background-color: #020617;
      margin: 0;
      padding: 20px;
    }
    .container { 
      max-width: 100%; 
      margin: 0 auto; 
      background-color: #1e293b;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      border: 1px solid #374151;
    }
    .header { 
      background: linear-gradient(135deg, #eab308 0%, #f59e0b 100%);
      color: #020617; 
      padding: 30px 20px; 
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    .content { 
      padding: 30px 25px; 
      background-color: #1e293b;
    }
    .content h2 {
      color: #eab308;
      margin-top: 0;
      font-size: 24px;
      border-bottom: 2px solid #374151;
      padding-bottom: 10px;
    }
    .content h3 {
      color: #e2e8f0;
      margin-top: 25px;
      margin-bottom: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 20px 0;
    }
    .info-item {
      background-color: #374151;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #eab308;
      margin-bottom: 5px;
    }
    .info-label {
      font-weight: bold;
      color: #eab308;
      font-size: 14px;
      margin-bottom: 5px;
    }
    .info-value {
      color: #e2e8f0;
      font-size: 16px;
    }
    .observaciones {
      background-color: #374151;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #eab308;
    }
    .button { 
      display: inline-block; 
      background: linear-gradient(135deg, #eab308 0%, #f59e0b 100%);
      color: #020617; 
      padding: 15px 30px; 
      text-decoration: none; 
      border-radius: 8px; 
      margin: 25px 0;
      font-weight: bold;
      font-size: 16px;
      text-align: center;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(234, 179, 8, 0.3);
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(234, 179, 8, 0.4);
    }
    .productos { 
      background-color: #374151; 
      padding: 20px; 
      border-radius: 8px; 
      margin: 20px 0;
      border: 1px solid #4b5563;
    }
    .productos h3 {
      margin-top: 0;
      color: #eab308;
    }
    .productos ul {
      margin: 0;
      padding-left: 20px;
    }
    .productos li {
      margin: 8px 0;
      color: #e2e8f0;
    }
    .url-box {
      background-color: #374151;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
      border: 1px dashed #6b7280;
      word-break: break-all;
    }
    .footer { 
      text-align: center; 
      color: #9ca3af; 
      font-size: 12px; 
      padding: 20px;
      background-color: #374151;
      border-top: 1px solid #4b5563;
    }
    .warning-icon {
      color: #eab308;
      margin-right: 8px;
    }
    .confirmation-section {
      background-color: #374151;
      padding: 25px;
      border-radius: 8px;
      margin: 25px 0;
      text-align: center;
      border: 2px solid #eab308;
    }
    
    /* Responsive */
    @media (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
      .container {
        margin: 10px;
        border-radius: 8px;
      }
      .content {
        padding: 20px 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1> Entrega ${accion === "creada" ? "Creada" : "Actualizada"}</h1>
    </div>
    
    <div class="content">
      <h2>${entrega.proyecto}</h2>
      
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">FECHA</div>
          <div class="info-value">${new Date(entrega.fecha).toLocaleDateString(
            "es-ES"
          )}</div>
        </div>
        <div class="info-item">
          <div class="info-label">TÉCNICO</div>
          <div class="info-value">${
            entrega.tecnicoData?.nombre || "No especificado"
          }</div>
        </div>
        <div class="info-item">
          <div class="info-label">ALMACENISTA</div>
          <div class="info-value">${
            entrega.almacenistaData?.nombre || "No especificado"
          }</div>
        </div>
        <div class="info-item">
          <div class="info-label">ESTADO</div>
          <div class="info-value">${
            accion === "creada" ? "Pendiente Confirmación" : "Actualizada"
          }</div>
        </div>
      </div>
      
      ${
        entrega.observaciones
          ? `
      <div class="observaciones">
        <div class="info-label">OBSERVACIONES</div>
        <div class="info-value">${entrega.observaciones}</div>
      </div>
      `
          : ""
      }
      
      <div class="productos">
        <h3>Productos ${
          accion === "creada" ? "Entregados" : "Actualizados"
        }:</h3>
        <ul>
          ${productosHtml}
        </ul>
      </div>
      
      <div class="confirmation-section">
        <h3 style="margin-top: 0; color: #eab308;">Confirmación Requerida</h3>
        <p>Para confirmar la recepción de esta entrega, haga clic en el siguiente botón:</p>
        
        <a href="${confirmationUrl}" class="button">✅ Confirmar Entrega</a>
        
        <p style="margin-top: 20px; font-size: 14px;">
          <span class="warning-icon">⏰</span>
          <strong>Este enlace es válido por 7 días.</strong>
        </p>
        
        <p style="font-size: 13px; color: #9ca3af; margin-bottom: 10px;">
          Si no puede hacer clic en el botón, copie y pegue la siguiente URL en su navegador:
        </p>
        <div class="url-box">
          <small style="color: #e2e8f0;">${confirmationUrl}</small>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>🤖 Este es un email automático, por favor no responda a este mensaje.</p>
      <p style="margin-top: 10px; color: #6b7280;">
        Sistema de Gestión de Entregas | © 2025
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

// Función para enviar email de confirmación
const sendConfirmationEmail = async (
  entrega,
  recipientEmail,
  accion = "creada"
) => {
  try {
    // Generar token de confirmación
    const token = generateConfirmationToken(entrega.id);

    // Guardar token en base de datos con expiración
    await db.ConfirmacionToken.create({
      entregaId: entrega.id,
      token: token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    });

    // URL de confirmación
    const confirmationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/confirmar-entrega/${token}`;

    // Opciones del email
    const mailOptions = {
      from: `"Sistema de Entregas" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `Confirmación de Entrega - ${entrega.proyecto}`,
      html: createEmailTemplate(entrega, confirmationUrl, accion),
    };

    // Enviar email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado:", info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error enviando email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendConfirmationEmail,
  generateConfirmationToken,
};
