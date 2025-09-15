// routes/legalizacion.js
const express = require("express");
const router = express.Router();
const LegalizacionController = require("../controllers/legalizacion.controller");
// const { authenticateToken } = require('../middleware/auth'); // Ajusta según tu middleware

// // Middleware de autenticación para todas las rutas
// router.use(authenticateToken);

// Crear nueva legalización (desde app móvil)
router.post("/legalizacion", LegalizacionController.create);

router.get("/legalizacion", LegalizacionController.findAll);

// Obtener legalizaciones pendientes
router.get("/legalizacion/pendientes", LegalizacionController.getPendientes);

// Obtener legalizaciones por entrega
router.get(
  "/legalizacion/entrega/:entregaId",
  LegalizacionController.getByEntrega
);

router.post("/legalizacions/multiple", LegalizacionController.aprobarMultiples);

// Obtener legalización por ID
router.get("/legalizacion/:id", LegalizacionController.getById);
router.delete("/legalizacion/:id", LegalizacionController.eliminar);

// Aprobar legalización
router.put("/legalizacion/:id/aprobar", LegalizacionController.aprobar);

// Rechazar legalización
router.put("/legalizacion/:id/rechazar", LegalizacionController.rechazar);

// Obtener legalizaciones por técnico
router.get(
  "/legalizacion/tecnico/:personalId",
  LegalizacionController.getByTecnico
);

// Obtener estadísticas de legalizaciones
router.get("/legalizacion/stats/resumen", LegalizacionController.getStats);

module.exports = router;
