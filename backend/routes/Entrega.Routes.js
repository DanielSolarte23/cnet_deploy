const EntregaController = require("../controllers/Entrega.Controller");
const ActaController = require("../controllers/acta.Controller");
const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Entrega
 *   description: Endpoints para la gestión de entregas y productos asociados
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 15
 *         descripcion:
 *           type: string
 *           example: Router TP-Link
 *         marca:
 *           type: string
 *           example: TP-Link
 *         color:
 *           type: string
 *           example: Blanco
 *         stock:
 *           type: integer
 *           example: 25
 *         stockMinimo:
 *           type: integer
 *           example: 5
 *
 *     EntregaProducto:
 *       type: object
 *       properties:
 *         ProductoId:
 *           type: integer
 *           example: 1
 *         cantidad:
 *           type: integer
 *           example: 3
 *         unidadesSeriadas:
 *           type: array
 *           items:
 *             type: integer
 *           example: [12, 13, 14]
 *         Producto:
 *           $ref: '#/components/schemas/Producto'
 *
 *     Entrega:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         fecha:
 *           type: string
 *           format: date-time
 *           example: "2025-10-10T13:00:00Z"
 *         proyecto:
 *           type: string
 *           example: Instalación Fibra Popayán
 *         estado:
 *           type: string
 *           example: pendiente
 *         almacenistaData:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 2
 *             nombre:
 *               type: string
 *               example: Juan Pérez
 *         tecnicoData:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 5
 *             nombre:
 *               type: string
 *               example: Carlos Díaz
 *             cedula:
 *               type: string
 *               example: "1085246932"
 *         EntregaProductos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EntregaProducto'
 */

/**
 * @swagger
 * /api/entrega:
 *   post:
 *     summary: Crear una nueva entrega con productos y envío de correo opcional
 *     tags: [Entrega]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entrega:
 *                 type: object
 *                 properties:
 *                   proyecto:
 *                     type: string
 *                     example: Instalación sede norte
 *                   fecha:
 *                     type: string
 *                     format: date
 *                     example: "2025-10-10"
 *                   almacenistaId:
 *                     type: integer
 *                     example: 2
 *                   personalId:
 *                     type: integer
 *                     example: 5
 *                   estado:
 *                     type: string
 *                     example: pendiente
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ProductoId:
 *                       type: integer
 *                       example: 4
 *                     cantidad:
 *                       type: integer
 *                       example: 10
 *                     unidadesSeriadas:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [101, 102, 103]
 *               recipientEmail:
 *                 type: string
 *                 example: "tecnico@empresa.com"
 *     responses:
 *       201:
 *         description: Entrega creada correctamente
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
 *                   example: Entrega creada correctamente
 *                 data:
 *                   $ref: '#/components/schemas/Entrega'
 *                 emailSent:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Error en los datos de la solicitud
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/entrega:
 *   get:
 *     summary: Obtener todas las entregas
 *     tags: [Entrega]
 *     responses:
 *       200:
 *         description: Lista de entregas obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Entrega'
 *       500:
 *         description: Error al obtener las entregas
 */

/**
 * @swagger
 * /api/entrega/{id}:
 *   get:
 *     summary: Obtener una entrega por su ID
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la entrega
 *     responses:
 *       200:
 *         description: Entrega encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Entrega'
 *       404:
 *         description: Entrega no encontrada
 */

/**
 * @swagger
 * /api/entrega/{id}:
 *   put:
 *     summary: Actualizar una entrega existente
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la entrega
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Entrega'
 *     responses:
 *       200:
 *         description: Entrega actualizada correctamente
 *       404:
 *         description: Entrega no encontrada
 *       500:
 *         description: Error al actualizar la entrega
 */

/**
 * @swagger
 * /api/entrega/{id}:
 *   delete:
 *     summary: Eliminar una entrega por su ID
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la entrega a eliminar
 *     responses:
 *       200:
 *         description: Entrega eliminada correctamente
 *       404:
 *         description: Entrega no encontrada
 */

/**
 * @swagger
 * /api/entrega/filtro:
 *   get:
 *     summary: Filtrar entregas por técnico, almacenista, o estado
 *     tags: [Entrega]
 *     parameters:
 *       - in: query
 *         name: tecnico
 *         schema:
 *           type: string
 *         description: Nombre o ID del técnico
 *       - in: query
 *         name: almacenista
 *         schema:
 *           type: string
 *         description: Nombre o ID del almacenista
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Estado de la entrega
 *     responses:
 *       200:
 *         description: Entregas filtradas correctamente
 *       404:
 *         description: No se encontraron entregas con esos filtros
 */

/**
 * @swagger
 * /api/entregas/{id}/productos:
 *   put:
 *     summary: Actualizar los productos asociados a una entrega
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la entrega
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ProductoId:
 *                       type: integer
 *                       example: 1
 *                     cantidad:
 *                       type: integer
 *                       example: 5
 *                     unidadesSeriadas:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [101, 102, 103]
 *     responses:
 *       200:
 *         description: Productos actualizados correctamente
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
 *                   example: Productos actualizados correctamente
 *       404:
 *         description: Entrega no encontrada
 *       500:
 *         description: Error al actualizar los productos
 */

/**
 * @swagger
 * /api/productos/{productoId}/unidades-disponibles:
 *   get:
 *     summary: Obtener las unidades disponibles de un producto específico
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: productoId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Lista de unidades disponibles del producto
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
 *                       id:
 *                         type: integer
 *                         example: 101
 *                       numeroSerie:
 *                         type: string
 *                         example: "SN-12345-ABC"
 *                       estado:
 *                         type: string
 *                         example: "disponible"
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error al obtener unidades disponibles
 */

/**
 * @swagger
 * /api/entregas/{entregaId}/productos/{productoId}/unidades:
 *   get:
 *     summary: Obtener las unidades de un producto específico en una entrega
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: entregaId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la entrega
 *       - in: path
 *         name: productoId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Lista de unidades del producto en la entrega
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     entregaId:
 *                       type: integer
 *                       example: 10
 *                     productoId:
 *                       type: integer
 *                       example: 5
 *                     cantidad:
 *                       type: integer
 *                       example: 3
 *                     unidades:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 101
 *                           numeroSerie:
 *                             type: string
 *                             example: "SN-12345-ABC"
 *       404:
 *         description: Entrega o producto no encontrado
 *       500:
 *         description: Error al obtener las unidades
 */

/**
 * @swagger
 * /api/entregas/confirmar-entrega/{token}:
 *   get:
 *     summary: Confirmar una entrega mediante token de confirmación
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token de confirmación de la entrega
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Entrega confirmada exitosamente
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
 *                   example: Entrega confirmada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 10
 *                     estado:
 *                       type: string
 *                       example: confirmada
 *                     fechaConfirmacion:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-10T15:30:00Z"
 *       400:
 *         description: Token inválido o expirado
 *       404:
 *         description: Entrega no encontrada
 *       500:
 *         description: Error al confirmar la entrega
 */

/**
 * @swagger
 * /api/entregas/{id}/acta:
 *   get:
 *     summary: Generar y descargar el acta de entrega en formato PDF
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la entrega
 *     responses:
 *       200:
 *         description: Acta generada correctamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Entrega no encontrada
 *       500:
 *         description: Error al generar el acta
 */

/**
 * @swagger
 * /api/entregas/{id}/acta/preview:
 *   get:
 *     summary: Obtener vista previa del acta de entrega en formato HTML
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la entrega
 *     responses:
 *       200:
 *         description: Vista previa del acta obtenida correctamente
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html><body><h1>Acta de Entrega</h1>...</body></html>"
 *       404:
 *         description: Entrega no encontrada
 *       500:
 *         description: Error al generar la vista previa
 */

/**
 * @swagger
 * /api/{entregaId}/regenerate-token:
 *   post:
 *     summary: Regenerar el token de confirmación y reenviar correo electrónico
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: entregaId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la entrega
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientEmail:
 *                 type: string
 *                 example: "nuevotecnico@empresa.com"
 *                 description: Email alternativo para reenviar (opcional)
 *     responses:
 *       200:
 *         description: Token regenerado y correo enviado correctamente
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
 *                   example: Token regenerado y correo enviado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     entregaId:
 *                       type: integer
 *                       example: 10
 *                     emailSent:
 *                       type: boolean
 *                       example: true
 *                     newTokenGenerated:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Entrega no encontrada
 *       500:
 *         description: Error al regenerar el token o enviar el correo
 */

// Rutas para la entidad Entrega
router.post("/entrega", EntregaController.create); // Crear una nueva entrega
router.get("/entrega", EntregaController.findAll); // Obtener todas las entregas
router.get("/entrega/:id", EntregaController.findOne); // Obtener una entrega por ID
router.get("/entrega/filtro", EntregaController.findByFilters); // Obtener entregas por filtro
router.put("/entregas/:id/productos", EntregaController.updateProductos);

// Obtener unidades disponibles de un producto
router.get("/productos/:productoId/unidades-disponibles", EntregaController.getUnidadesDisponibles);

// Obtener unidades de un producto específico en una entrega
router.get("/entregas/:entregaId/productos/:productoId/unidades", EntregaController.getUnidadesEnEntrega);

router.put("/entrega/:id", EntregaController.update); // Actualizar una entrega por ID
router.delete("/entrega/:id", EntregaController.delete); // Eliminar una entrega por ID

// Confirmar entrega mediante token
router.get('/entregas/confirmar-entrega/:token', EntregaController.confirmEntrega);

// Rutas para la generación de actas
router.get("/entregas/:id/acta", ActaController.generarActa);
router.get("/entregas/:id/acta/preview", ActaController.vistaPrevia);

// Regenerar token de confirmación
router.post('/:entregaId/regenerate-token', EntregaController.regenerateConfirmationToken);

module.exports = router;