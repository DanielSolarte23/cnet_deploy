<<<<<<< HEAD
const express = require("express");
const router = express.Router();
const NotificacionController = require("../controllers/Notificaciones.Controller");

/**
 * @swagger
 * tags:
 *   name: Notificaciones
 *   description: Endpoints para gestionar notificaciones del sistema
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Notificacion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autoincremental de la notificación
 *         mensaje:
 *           type: string
 *           description: Mensaje de la notificación
 *         tipo:
 *           type: string
 *           description: Tipo o categoría de la notificación (ej: alerta, sistema, stock)
 *         leida:
 *           type: boolean
 *           description: Indica si la notificación fue leída
 *         fechaGeneracion:
 *           type: string
 *           format: date-time
 *           description: Fecha en que se generó la notificación
 *         fechaLectura:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Fecha en que se leyó la notificación
 *         usuarioId:
 *           type: integer
 *           nullable: true
 *           description: ID del usuario destinatario (puede ser null si es general)
 *         productoId:
 *           type: integer
 *           nullable: true
 *           description: ID del producto asociado (si aplica)
 *       example:
 *         id: 1
 *         mensaje: "El producto XYZ está por debajo del stock mínimo"
 *         tipo: "stock"
 *         leida: false
 *         fechaGeneracion: "2025-10-10T14:00:00Z"
 *         usuarioId: 2
 *         productoId: 5
 */

/**
 * @swagger
 * /notificaciones:
 *   get:
 *     summary: Obtiene todas las notificaciones
 *     tags: [Notificaciones]
 *     responses:
 *       200:
 *         description: Lista de notificaciones existentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notificacion'
 */
router.get("/notificaciones", NotificacionController.findAll);

/**
 * @swagger
 * /notificaciones/usuario/{usuarioId}:
 *   get:
 *     summary: Obtiene todas las notificaciones de un usuario específico
 *     tags: [Notificaciones]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de notificaciones del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notificacion'
 */
router.get("/notificaciones/usuario/:usuarioId", NotificacionController.findByUsuario);

/**
 * @swagger
 * /notificaciones:
 *   post:
 *     summary: Crea una nueva notificación
 *     tags: [Notificaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notificacion'
 *     responses:
 *       201:
 *         description: Notificación creada correctamente
 *       400:
 *         description: Error al crear la notificación
 */
router.post("/notificaciones", NotificacionController.create);

/**
 * @swagger
 * /notificaciones/{id}/leida:
 *   put:
 *     summary: Marca una notificación como leída
 *     tags: [Notificaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 *       404:
 *         description: Notificación no encontrada
 */
router.put("/notificaciones/:id/leida", NotificacionController.marcarLeida);

/**
 * @swagger
 * /notificaciones/leidas/{usuarioId}:
 *   put:
 *     summary: Marca todas las notificaciones de un usuario como leídas
 *     tags: [Notificaciones]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Todas las notificaciones marcadas como leídas
 *       400:
 *         description: Error al actualizar las notificaciones
 */
router.put("/notificaciones/leidas/:usuarioId", NotificacionController.marcarTodasLeidas);

/**
 * @swagger
 * /notificaciones/{id}:
 *   delete:
 *     summary: Elimina una notificación por su ID
 *     tags: [Notificaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la notificación a eliminar
 *     responses:
 *       200:
 *         description: Notificación eliminada correctamente
 *       404:
 *         description: Notificación no encontrada
 */
router.delete("/notificaciones/:id", NotificacionController.delete);

module.exports = router;
=======
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
>>>>>>> b634081f73f866f6ea68bc240a750b8bdf688b4d
