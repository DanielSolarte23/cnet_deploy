const express = require("express");
const router = express.Router();
const LegalizacionController = require("../controllers/legalizacion.controller");

/**
 * @swagger
 * tags:
 *   name: Legalización
 *   description: Gestión de legalizaciones de productos entregados
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Legalizacion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         entregaId:
 *           type: integer
 *           example: 10
 *         productoId:
 *           type: integer
 *           example: 5
 *         personalId:
 *           type: integer
 *           example: 3
 *         cantidad:
 *           type: integer
 *           example: 2
 *         tipo:
 *           type: string
 *           enum: [instalado, baja]
 *           example: instalado
 *         justificacion:
 *           type: string
 *           example: Instalación en sede cliente
 *         observaciones:
 *           type: string
 *           example: Instalado en piso 3
 *         ubicacion:
 *           type: string
 *           example: Calle 45 #23-12, Bogotá
 *         evidencia:
 *           type: string
 *           example: https://ejemplo.com/foto-instalacion.jpg
 *         unidadesSeriadas:
 *           type: array
 *           items:
 *             type: integer
 *           example: [101, 102]
 *         estado:
 *           type: string
 *           enum: [pendiente, aprobada, rechazada]
 *           example: pendiente
 *         fecha:
 *           type: string
 *           format: date-time
 *           example: "2025-10-10T14:30:00Z"
 *         fechaAprobacion:
 *           type: string
 *           format: date-time
 *           example: "2025-10-11T09:00:00Z"
 *         almacenistaId:
 *           type: integer
 *           example: 2
 *         motivoRechazo:
 *           type: string
 *           example: Falta evidencia fotográfica
 *         producto:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             codigo:
 *               type: string
 *             descripcion:
 *               type: string
 *             marca:
 *               type: string
 *         tecnicoData:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *             cedula:
 *               type: string
 *         entregaOriginal:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             proyecto:
 *               type: string
 *             fecha:
 *               type: string
 *               format: date-time
 */

/**
 * @swagger
 * /api/legalizacion:
 *   post:
 *     summary: Crear nueva legalización desde app móvil
 *     tags: [Legalización]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entregaId
 *               - productos
 *               - tipo
 *               - personalId
 *             properties:
 *               entregaId:
 *                 type: integer
 *                 example: 10
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productoId:
 *                       type: integer
 *                       example: 5
 *                     cantidad:
 *                       type: integer
 *                       example: 2
 *                     unidadesSeriadas:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [101, 102]
 *               tipo:
 *                 type: string
 *                 enum: [instalado, baja]
 *                 example: instalado
 *               justificacion:
 *                 type: string
 *                 example: Instalación completa en sede
 *               observaciones:
 *                 type: string
 *                 example: Todo funcionando correctamente
 *               ubicacion:
 *                 type: string
 *                 example: Calle 45 #23-12
 *               evidencia:
 *                 type: string
 *                 example: https://ejemplo.com/foto.jpg
 *               personalId:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Legalización(es) creada(s) correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "2 legalización(es) creada(s) correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Legalizacion'
 *       400:
 *         description: Error en los datos de la solicitud
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/legalizacion:
 *   get:
 *     summary: Obtener todas las legalizaciones con paginación
 *     tags: [Legalización]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Cantidad de items por página
 *     responses:
 *       200:
 *         description: Lista de legalizaciones obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Legalizacion'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalItems:
 *                       type: integer
 *                       example: 48
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 *                     itemsInCurrentPage:
 *                       type: integer
 *                       example: 10
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                     nextPage:
 *                       type: integer
 *                       example: 2
 *                     prevPage:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *       400:
 *         description: Parámetros de paginación inválidos
 *       500:
 *         description: Error al obtener legalizaciones
 */

/**
 * @swagger
 * /api/legalizacion/pendientes:
 *   get:
 *     summary: Obtener todas las legalizaciones pendientes
 *     tags: [Legalización]
 *     responses:
 *       200:
 *         description: Lista de legalizaciones pendientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Legalizacion'
 *       500:
 *         description: Error al obtener legalizaciones pendientes
 */

/**
 * @swagger
 * /api/legalizacion/entrega/{entregaId}:
 *   get:
 *     summary: Obtener legalizaciones por entrega
 *     tags: [Legalización]
 *     parameters:
 *       - in: path
 *         name: entregaId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la entrega
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, aprobada, rechazada]
 *         description: Filtrar por estado (opcional)
 *     responses:
 *       200:
 *         description: Lista de legalizaciones de la entrega
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Legalizacion'
 *       500:
 *         description: Error al obtener legalizaciones
 */

/**
 * @swagger
 * /api/legalizacions/multiple:
 *   post:
 *     summary: Aprobar múltiples legalizaciones
 *     tags: [Legalización]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - legalizacionIds
 *               - almacenistaId
 *             properties:
 *               legalizacionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3, 4]
 *               almacenistaId:
 *                 type: integer
 *                 example: 2
 *               observaciones:
 *                 type: string
 *                 example: Aprobadas en lote
 *     responses:
 *       200:
 *         description: Legalizaciones aprobadas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "4 legalización(es) aprobada(s) correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Legalizacion'
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error al aprobar legalizaciones
 */

/**
 * @swagger
 * /api/legalizacion/{id}:
 *   get:
 *     summary: Obtener legalización por ID
 *     tags: [Legalización]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la legalización
 *     responses:
 *       200:
 *         description: Legalización encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Legalizacion'
 *       404:
 *         description: Legalización no encontrada
 *       500:
 *         description: Error al obtener la legalización
 */

/**
 * @swagger
 * /api/legalizacion/{id}:
 *   delete:
 *     summary: Eliminar legalización (solo para debug/desarrollo)
 *     tags: [Legalización]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la legalización a eliminar
 *     responses:
 *       200:
 *         description: Legalización eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Legalización eliminada correctamente (debug)
 *       400:
 *         description: Error al eliminar la legalización
 *       404:
 *         description: Legalización no encontrada
 */

/**
 * @swagger
 * /api/legalizacion/{id}/aprobar:
 *   put:
 *     summary: Aprobar una legalización individual
 *     tags: [Legalización]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la legalización
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - almacenistaId
 *             properties:
 *               almacenistaId:
 *                 type: integer
 *                 example: 2
 *               observaciones:
 *                 type: string
 *                 example: Aprobado sin observaciones
 *     responses:
 *       200:
 *         description: Legalización aprobada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Legalización aprobada correctamente
 *                 data:
 *                   $ref: '#/components/schemas/Legalizacion'
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Legalización no encontrada
 *       500:
 *         description: Error al aprobar la legalización
 */

/**
 * @swagger
 * /api/legalizacion/{id}/rechazar:
 *   put:
 *     summary: Rechazar una legalización
 *     tags: [Legalización]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la legalización
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - almacenistaId
 *               - motivoRechazo
 *             properties:
 *               almacenistaId:
 *                 type: integer
 *                 example: 2
 *               motivoRechazo:
 *                 type: string
 *                 example: Falta evidencia fotográfica de la instalación
 *     responses:
 *       200:
 *         description: Legalización rechazada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Legalización rechazada correctamente
 *                 data:
 *                   $ref: '#/components/schemas/Legalizacion'
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Legalización no encontrada
 *       500:
 *         description: Error al rechazar la legalización
 */

/**
 * @swagger
 * /api/legalizacion/tecnico/{personalId}:
 *   get:
 *     summary: Obtener legalizaciones por técnico
 *     tags: [Legalización]
 *     parameters:
 *       - in: path
 *         name: personalId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del técnico (Personal)
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, aprobada, rechazada]
 *         description: Filtrar por estado (opcional)
 *     responses:
 *       200:
 *         description: Lista de legalizaciones del técnico
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Legalizacion'
 *       500:
 *         description: Error al obtener legalizaciones del técnico
 */

/**
 * @swagger
 * /api/legalizacion/stats/resumen:
 *   get:
 *     summary: Obtener estadísticas de legalizaciones
 *     tags: [Legalización]
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial para filtrar
 *         example: "2025-01-01"
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final para filtrar
 *         example: "2025-12-31"
 *       - in: query
 *         name: personalId
 *         schema:
 *           type: integer
 *         description: ID del técnico para filtrar
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [instalado, baja]
 *         description: Tipo de legalización para filtrar
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       estado:
 *                         type: string
 *                         example: aprobada
 *                       tipo:
 *                         type: string
 *                         example: instalado
 *                       cantidad:
 *                         type: integer
 *                         example: 25
 *                       totalUnidades:
 *                         type: integer
 *                         example: 150
 *       500:
 *         description: Error al obtener estadísticas
 */

// Crear nueva legalización (desde app móvil)
router.post("/legalizacion", LegalizacionController.create);

// Obtener todas las legalizaciones con paginación
router.get("/legalizacion", LegalizacionController.findAll);

// Obtener legalizaciones pendientes
router.get("/legalizacion/pendientes", LegalizacionController.getPendientes);

// Obtener legalizaciones por entrega
router.get("/legalizacion/entrega/:entregaId", LegalizacionController.getByEntrega);

// Aprobar múltiples legalizaciones
router.post("/legalizacions/multiple", LegalizacionController.aprobarMultiples);

// Obtener legalización por ID
router.get("/legalizacion/:id", LegalizacionController.getById);

// Eliminar legalización (debug)
router.delete("/legalizacion/:id", LegalizacionController.eliminar);

// Aprobar legalización individual
router.put("/legalizacion/:id/aprobar", LegalizacionController.aprobar);

// Rechazar legalización
router.put("/legalizacion/:id/rechazar", LegalizacionController.rechazar);

// Obtener legalizaciones por técnico
router.get("/legalizacion/tecnico/:personalId", LegalizacionController.getByTecnico);

// Obtener estadísticas de legalizaciones
router.get("/legalizacion/stats/resumen", LegalizacionController.getStats);

module.exports = router;