const NotificacionController = require("../controllers/Notificaciones.Controller");
const express = require("express");
const router = express.Router();

// Obtener todas las notificaciones
router.get("/notificaciones", NotificacionController.findAll);
// Obtener notificaciones por usuario
router.get(
  "/notificaciones/usuario/:usuarioId",
  NotificacionController.findByUsuario
);

// Crear una nueva notificación
router.post("/notificaciones", NotificacionController.create);
// Marcar notificación como leída
router.put("/notificaciones/:id/leida", NotificacionController.marcarLeida);

// Eliminar una notificación
router.delete("/notificaciones/:id", NotificacionController.delete);

router.put(
  "/notificaciones/leidas/:usuarioId",
  NotificacionController.marcarTodasLeidas
);

module.exports = router;