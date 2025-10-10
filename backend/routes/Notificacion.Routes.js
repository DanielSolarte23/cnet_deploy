const express = require('express');
const router = express.Router();
const NotificacionController = require('../controllers/Notificaciones.Controller');

// Rutas básicas CRUD
router.get('/', NotificacionController.findAll);
router.post('/', NotificacionController.create);
router.delete('/:id', NotificacionController.delete);

// Rutas específicas por usuario
router.get('/usuario/:usuarioId', NotificacionController.findByUsuario);
router.get('/usuario/:usuarioId/count', NotificacionController.getUnreadCountByUsuario);
router.patch('/usuario/:usuarioId/marcar-todas-leidas', NotificacionController.marcarTodasLeidasUsuario);

// Rutas específicas por personal
router.get('/personal/:personalId', NotificacionController.findByPersonal);
router.get('/personal/:personalId/count', NotificacionController.getUnreadCountByPersonal);
router.patch('/personal/:personalId/marcar-todas-leidas', NotificacionController.marcarTodasLeidasPersonal);

// Rutas de notificación individual
router.patch('/:id/marcar-leida', NotificacionController.marcarLeida);

// Ruta SSE para conexión en tiempo real
    router.get('/sse', NotificacionController.sseConnect);

// Ruta para estadísticas SSE (opcional, para debugging)
router.get('/sse/stats', NotificacionController.getSSEStats);

if (process.env.NODE_ENV !== 'production') {
  router.post('/test', NotificacionController.testNotification);
}

module.exports = router;