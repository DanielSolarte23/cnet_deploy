const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet"); // Seguridad adicional
const compression = require("compression"); // Compresión gzip
const rateLimit = require("express-rate-limit"); // Rate limiting
const { sequelize } = require("./models");
const swaggerDocs = require('./docs/swagger');

// Importar rutas
const usuarioRoutes = require("./routes/user.Routes");
const authRoutes = require("./routes/auth.Routes");
const stantRoutes = require("./routes/Stant.Routes");
const productoRoutes = require("./routes/producto.Routes");
const categoriaRoutes = require("./routes/categoria.Routes");
const personalRoutes = require("./routes/Personal.Routes");
const EntregaRoutes = require("./routes/Entrega.Routes");
const ReintegroRoutes = require("./routes/Reintegro.Routes");
const NotificacionRoutes = require("./routes/Notificacion.Routes");
const ProductosAsignadosRoutes = require("./routes/ProductosAsignados.Routes");
const LegalizacionesRoutes = require("./routes/legalizacion.routes");
const CuentasRoutes = require("./routes/cuentas.Routes");

// Variables de entorno
const PORT = process.env.PORT || 3004;
const NODE_ENV = process.env.NODE_ENV || "development";

// CORS más flexible - permite múltiples orígenes
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://172.16.110.74:3000",
      "http://172.16.110.74:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      // Agregar más variaciones comunes
      "http://0.0.0.0:3000",
      "http://0.0.0.0:3001",
    ];

const app = express();

// Configuración de seguridad con Helmet MÁS FLEXIBLE
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Más permisivo para Next.js
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "http:"], // Permitir http también
        connectSrc: ["'self'", "http:", "https:", "ws:", "wss:"], // Para WebSockets de Next.js
        fontSrc: ["'self'", "data:", "https:", "http:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Importante para Next.js
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Más permisivo
  })
);

// Compresión gzip para mejorar rendimiento
app.use(compression());

// Rate limiting MENOS AGRESIVO
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: NODE_ENV === "production" ? 500 : 2000, // Más requests permitidos
  message: {
    error:
      "Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Saltar rate limiting para health check
    return req.path === "/health";
  },
});

// Rate limiting para auth MÁS PERMISIVO
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: NODE_ENV === "production" ? 20 : 100, // Más intentos permitidos
  message: {
    error:
      "Demasiados intentos de autenticación, por favor intenta de nuevo más tarde.",
  },
  skipSuccessfulRequests: true, // No contar requests exitosos
  skip: (req) => {
    // Saltar para verificación de token
    return req.path.includes("/verify");
  },
});

// Aplicar rate limiting general SOLO EN PRODUCCIÓN
if (NODE_ENV === "production") {
  app.use((req, res, next) => {
    // Saltar rate limiting para rutas críticas
    if (req.path.includes("/health") || req.path.includes("/verify")) {
      return next();
    }
    return limiter(req, res, next);
  });
} else {
  console.log("Rate limiting DESACTIVADO en desarrollo");
}

// Configuración de CORS SUPER FLEXIBLE para debugging
app.use(
  cors({
    origin: function (origin, callback) {
      console.log(`CORS: Verificando origen: ${origin}`);

      // TEMPORAL: Permitir TODOS los orígenes en desarrollo
      if (NODE_ENV === "development") {
        console.log(
          "CORS: Modo desarrollo - permitiendo TODOS los orígenes"
        );
        return callback(null, true);
      }

      // Permitir requests sin origen (como mobile apps, Postman, etc.)
      if (!origin) {
        console.log("CORS: Permitiendo request sin origen");
        return callback(null, true);
      }

      // En producción, verificar lista de permitidos
      const isAllowed = ALLOWED_ORIGINS.some(
        (allowedOrigin) =>
          origin === allowedOrigin || origin.startsWith(allowedOrigin)
      );

      if (isAllowed) {
        console.log("CORS: Origen permitido");
        callback(null, true);
      } else {
        console.log(`CORS: Origen no permitido: ${origin}`);
        console.log(
          `CORS: Orígenes permitidos: ${ALLOWED_ORIGINS.join(", ")}`
        );
        callback(null, true); // TEMPORAL: Permitir todos en producción también para debugging
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Cookie",
      "Set-Cookie",
      "Cache-Control",
      "Pragma",
    ],
    exposedHeaders: ["Set-Cookie", "Authorization"], // Exponer headers importantes
    optionsSuccessStatus: 200, // Para legacy browser support
    preflightContinue: false,
  })
);

// Middleware de logging
if (NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

// Middleware de parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10mb" }));

// Servir archivos estáticos
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: NODE_ENV === "production" ? "1d" : "0",
  })
);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: NODE_ENV === "production" ? "1d" : "0",
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    corsOrigins: ALLOWED_ORIGINS,
  });
});

// Debug endpoint para CORS (solo en desarrollo)
if (NODE_ENV === "development") {
  app.get("/debug/cors", (req, res) => {
    res.json({
      origin: req.get("Origin"),
      headers: req.headers,
      allowedOrigins: ALLOWED_ORIGINS,
    });
  });
}

// Aplicar rate limiting específico para rutas de autenticación SOLO EN PRODUCCIÓN
if (NODE_ENV === "production") {
  app.use("/api/auth", (req, res, next) => {
    // Saltar para verificación de token
    if (req.path.includes("/verify") || req.path.includes("/logout")) {
      return next();
    }
    return authLimiter(req, res, next);
  });
} else {
  console.log("Auth rate limiting DESACTIVADO en desarrollo");
}

// Configuración de rutas
app.use("/api", usuarioRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", stantRoutes);
app.use("/api", productoRoutes);
app.use("/api", categoriaRoutes);
app.use("/api", personalRoutes);
app.use("/api", EntregaRoutes);
app.use("/api", ReintegroRoutes);
app.use("/api/notificaciones", NotificacionRoutes);
app.use("/api", ProductosAsignadosRoutes);
app.use("/api", LegalizacionesRoutes);
app.use("/api", CuentasRoutes);

swaggerDocs(app);

// Middleware de manejo de errores 404
app.use("*", (req, res) => {
  console.log(`404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Endpoint no encontrado",
    method: req.method,
    url: req.originalUrl,
  });
});

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  // Manejar errores de CORS específicamente
  if (err.message.includes("CORS")) {
    return res.status(403).json({
      error: "Error de CORS",
      message: err.message,
      origin: req.get("Origin"),
    });
  }

  const errorMessage =
    NODE_ENV === "production" ? "Error interno del servidor" : err.message;

  res.status(err.status || 500).json({
    error: errorMessage,
    ...(NODE_ENV !== "production" && {
      stack: err.stack,
      origin: req.get("Origin"),
      method: req.method,
      url: req.originalUrl,
    }),
  });
});

// Función para iniciar el servidor
async function startServer() {
  try {
    // Probar conexión a la base de datos
    await sequelize.authenticate();
    console.log("Conexión a la base de datos establecida correctamente");

    // Sincronizar modelos
    if (NODE_ENV === "development") {
      await sequelize.sync();
      console.log("Base de datos sincronizada");
    } else {
      console.log("En producción - usando migraciones existentes");
    }

    // Iniciar servidor
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor ejecutándose en puerto ${PORT}`);
      console.log(`Entorno: ${NODE_ENV}`);
      console.log(
        `Health check disponible en: http://localhost:${PORT}/health`
      );
      console.log(`Orígenes CORS permitidos:`, ALLOWED_ORIGINS);
      console.log(
        `Rate limiting:`,
        NODE_ENV === "production" ? "ACTIVADO" : "DESACTIVADO"
      );
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("Recibido SIGTERM, cerrando servidor...");
      server.close(() => {
        console.log("Servidor cerrado correctamente");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("Recibido SIGINT, cerrando servidor...");
      server.close(() => {
        console.log("Servidor cerrado correctamente");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error(" Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

// Manejar errores no capturados
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // En desarrollo, no cerrar el servidor
  if (NODE_ENV === "production") {
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // En desarrollo, no cerrar el servidor
  if (NODE_ENV === "production") {
    process.exit(1);
  }
});

startServer();

// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// const bodyParser = require("body-parser");
// const usuarioRoutes = require("./routes/user.Routes");
// const authRoutes = require("./routes/auth.Routes");
// const stantRoutes = require("./routes/Stant.Routes");
// const productoRoutes = require("./routes/producto.Routes");
// const categoriaRoutes = require("./routes/categoria.Routes");
// const personalRoutes = require("./routes/Personal.Routes");
// const EntregaRoutes = require("./routes/Entrega.Routes");
// const ReintegroRoutes = require("./routes/Reintegro.Routes");
// const NotificacionRoutes = require("./routes/Notificacion.Routes");
// const ProductosAsignadosRoutes = require("./routes/ProductosAsignados.Routes")
// const cookieParser = require("cookie-parser");
// const { sequelize } = require("./models");
// const morgan = require("morgan");

// const PORT = process.env.PORT || 3004;
// const app = express();
// app.use(
//   cors({
//     origin: ["http://172.16.110.74:3000", "http://172.16.110.74:3001"],
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(cookieParser());
// app.use(morgan("dev"));
// app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, "public")));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use(bodyParser.json());
// app.use("/api", usuarioRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api", stantRoutes);
// app.use("/api", productoRoutes);
// app.use("/api", categoriaRoutes);
// app.use("/api", personalRoutes);
// app.use("/api", EntregaRoutes);
// app.use("/api", ReintegroRoutes);
// app.use("/api", NotificacionRoutes);
// app.use("/api", ProductosAsignadosRoutes)

// async function startServer() {
//   try {
//     // await sequelize.authenticate();
//     console.log("Database connected successfully s");

//     await sequelize.sync();
//     console.log("Database synchronized");

//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error("Unable to start server:", error);
//   }
// }

// startServer();
