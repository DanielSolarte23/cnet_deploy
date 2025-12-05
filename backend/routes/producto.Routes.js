const ProductoController = require("../controllers/Productos.Controller");
const express = require("express");
const validateProductoCreate = require("../middlewares/validateProductoCreate");
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       required:
 *         - descripcion
 *         - stock
 *         - stockMinimo
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del producto
 *         codigo:
 *           type: string
 *           description: Código único del producto (autogenerado si no se proporciona)
 *           example: "PRD-0001"
 *         descripcion:
 *           type: string
 *           description: Descripción del producto
 *           example: "Router TP-Link AC1200"
 *         marca:
 *           type: string
 *           description: Marca del producto
 *           example: "TP-Link"
 *         modelo:
 *           type: string
 *           description: Modelo del producto
 *           example: "Archer C6"
 *         stock:
 *           type: integer
 *           description: Cantidad actual en stock
 *           example: 50
 *         stockMinimo:
 *           type: integer
 *           description: Stock mínimo antes de alertas
 *           example: 10
 *         estado:
 *           type: string
 *           enum: [disponible, agotado]
 *           description: Estado del producto
 *         SubcategoriumId:
 *           type: integer
 *           description: ID de la subcategoría
 *         StantId:
 *           type: integer
 *           description: ID del estante donde se ubica
 *         stockDisponible:
 *           type: integer
 *           description: Stock disponible (calculado para productos seriados)
 *         stockTotal:
 *           type: integer
 *           description: Stock total incluyendo todas las unidades
 * 
 *     ProductoUnidad:
 *       type: object
 *       required:
 *         - serial
 *         - estado
 *       properties:
 *         id:
 *           type: integer
 *           description: ID de la unidad
 *         serial:
 *           type: string
 *           description: Número de serie único
 *           example: "SN123456789"
 *         estado:
 *           type: string
 *           enum: [nuevo, usado, baja, instalacion, instalado, reintegrado]
 *           description: Estado de la unidad
 *         productoId:
 *           type: integer
 *           description: ID del producto al que pertenece
 * 
 *     ProductoCreate:
 *       type: object
 *       required:
 *         - descripcion
 *         - stock
 *         - stockMinimo
 *       properties:
 *         codigo:
 *           type: string
 *           description: Código del producto (opcional, se genera automáticamente)
 *         descripcion:
 *           type: string
 *         marca:
 *           type: string
 *         modelo:
 *           type: string
 *         stock:
 *           type: integer
 *         stockMinimo:
 *           type: integer
 *         SubcategoriumId:
 *           type: integer
 *         StantId:
 *           type: integer
 *         unidades:
 *           type: array
 *           description: Array de unidades seriadas (opcional)
 *           items:
 *             type: object
 *             properties:
 *               serial:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [nuevo, usado]
 *         categoria:
 *           type: object
 *           description: Datos para crear nueva categoría
 *           properties:
 *             nombre:
 *               type: string
 *         subcategoria:
 *           type: object
 *           description: Datos para crear nueva subcategoría
 *           properties:
 *             nombre:
 *               type: string
 *             CategoriumId:
 *               type: integer
 *             crearCategoria:
 *               type: boolean
 * 
 *     AjustarStock:
 *       type: object
 *       required:
 *         - cantidad
 *       properties:
 *         cantidad:
 *           type: integer
 *           description: Cantidad a ajustar (positivo para aumentar, negativo para reducir)
 *           example: 10
 *         unidades:
 *           type: array
 *           description: Array de unidades para productos seriados (requerido si cantidad > 0)
 *           items:
 *             type: object
 *             properties:
 *               serial:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [nuevo, usado]
 *         eliminarSeriales:
 *           type: array
 *           description: Array de seriales para eliminar (requerido si cantidad < 0)
 *           items:
 *             type: string
 * 
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *         count:
 *           type: integer
 *         error:
 *           type: string
 */

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoCreate'
 *           examples:
 *             productoSimple:
 *               summary: Producto sin unidades seriadas
 *               value:
 *                 descripcion: "Cable UTP Cat6"
 *                 marca: "Nexxt"
 *                 modelo: "PCGPCCA6BL"
 *                 stock: 100
 *                 stockMinimo: 20
 *                 SubcategoriumId: 1
 *                 StantId: 5
 *             productoSeriado:
 *               summary: Producto con unidades seriadas
 *               value:
 *                 descripcion: "Router Cisco"
 *                 marca: "Cisco"
 *                 modelo: "C1111-8P"
 *                 stock: 0
 *                 stockMinimo: 2
 *                 unidades:
 *                   - serial: "SN001"
 *                     estado: "nuevo"
 *                   - serial: "SN002"
 *                     estado: "nuevo"
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Error en los datos proporcionados
 */

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtener todos los productos con información completa
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos con stock calculado
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
 *                     $ref: '#/components/schemas/Producto'
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener productos (versión lite con información reducida)
 *     tags: [Productos]
 *     description: Devuelve solo campos básicos para mejorar rendimiento
 *     responses:
 *       200:
 *         description: Lista de productos con información básica
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       codigo:
 *                         type: string
 *                       descripcion:
 *                         type: string
 *                       marca:
 *                         type: string
 *                       modelo:
 *                         type: string
 *                       stock:
 *                         type: integer
 *                       StantId:
 *                         type: integer
 */

/**
 * @swagger
 * /api/productos/busqueda-rapida:
 *   get:
 *     summary: Búsqueda rápida de productos
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda (código, descripción, marca, modelo o serial)
 *         example: "router"
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de resultados
 *       - in: query
 *         name: incluirUnidades
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir unidades seriadas en los resultados
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 *                 estadisticas:
 *                   type: object
 *                   properties:
 *                     totalEncontrados:
 *                       type: integer
 *                     productos:
 *                       type: integer
 *                     unidadesPorSerial:
 *                       type: integer
 *       400:
 *         description: Término de búsqueda requerido
 */

/**
 * @swagger
 * /api/productos/sugerencias:
 *   get:
 *     summary: Obtener sugerencias para autocompletado
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Término de búsqueda (mínimo 2 caracteres)
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Número máximo de sugerencias
 *     responses:
 *       200:
 *         description: Lista de sugerencias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       valor:
 *                         type: string
 *                       tipo:
 *                         type: string
 *                         enum: [codigo, descripcion, marca, modelo]
 *                       icono:
 *                         type: string
 */

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado
 *   put:
 *     summary: Actualizar un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               stockMinimo:
 *                 type: integer
 *               SubcategoriumId:
 *                 type: integer
 *               StantId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *       404:
 *         description: Producto no encontrado
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *       404:
 *         description: Producto no encontrado
 */

/**
 * @swagger
 * /api/productos/{id}/stock:
 *   put:
 *     summary: Ajustar el stock de un producto
 *     tags: [Productos]
 *     description: |
 *       Permite aumentar o reducir el stock de un producto.
 *       Para productos seriados se requiere proporcionar la información de unidades.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AjustarStock'
 *           examples:
 *             aumentarSeriado:
 *               summary: Aumentar stock con seriales
 *               value:
 *                 cantidad: 2
 *                 unidades:
 *                   - serial: "SN003"
 *                     estado: "nuevo"
 *                   - serial: "SN004"
 *                     estado: "nuevo"
 *             reducirSeriado:
 *               summary: Reducir stock con seriales
 *               value:
 *                 cantidad: -2
 *                 eliminarSeriales: ["SN001", "SN002"]
 *             aumentarSimple:
 *               summary: Aumentar stock simple
 *               value:
 *                 cantidad: 50
 *     responses:
 *       200:
 *         description: Stock ajustado correctamente
 *       400:
 *         description: Error en los datos o stock insuficiente
 *       404:
 *         description: Producto no encontrado
 */

/**
 * @swagger
 * /api/products/stock/bajo:
 *   get:
 *     summary: Obtener productos con stock bajo
 *     tags: [Productos]
 *     description: Devuelve productos cuyo stock disponible es menor o igual al stock mínimo
 *     responses:
 *       200:
 *         description: Lista de productos con stock bajo
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
 *                     $ref: '#/components/schemas/Producto'
 */

/**
 * @swagger
 * /api/products/stant/{stantId}:
 *   get:
 *     summary: Obtener productos por estante
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: stantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estante
 *     responses:
 *       200:
 *         description: Lista de productos del estante
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
 *                     $ref: '#/components/schemas/Producto'
 */

/**
 * @swagger
 * /api/products/{id}/unidades:
 *   get:
 *     summary: Obtener unidades seriadas de un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Lista de unidades del producto
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
 *                     $ref: '#/components/schemas/ProductoUnidad'
 *       404:
 *         description: No se encontraron unidades
 */

/**
 * @swagger
 * /api/buscar-entrega-producto:
 *   get:
 *     summary: Buscar entregas por producto
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: busqueda
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda (descripción de producto o serial)
 *     responses:
 *       200:
 *         description: Entregas encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 resultados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       entregaId:
 *                         type: integer
 *                       fecha:
 *                         type: string
 *                       proyecto:
 *                         type: string
 *                       tecnico:
 *                         type: string
 *                       productos:
 *                         type: array
 *       400:
 *         description: Valor de búsqueda requerido
 */

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: API para gestión de productos e inventario
 */

// Rutas para productos
router.post("/productos", validateProductoCreate, ProductoController.create); // Crear un nuevo producto
router.get("/productos", ProductoController.findAll); // Obtener todos los productos
router.get("/products", ProductoController.findAllLite); // Obtener todos los productos

router.get("/productos/busqueda-rapida", ProductoController.busquedaRapida);

// Obtener sugerencias para autocompletado
router.get("/productos/sugerencias", ProductoController.obtenerSugerencias);
router.get("/productos/:id", ProductoController.findOne); // Obtener un producto por ID

router.put("/productos/:id", ProductoController.update); // Actualizar un producto por ID
router.put("/productos/:id/stock", ProductoController.ajustarStock); // Actualizar stock de un producto por ID
router.get("/products/stock/bajo", ProductoController.getStockBajo); // Obtener productos con stock bajo
router.delete("/productos/:id", ProductoController.delete); // Eliminar un producto por ID
router.get("/products/stant/:stantId", ProductoController.findByStant); // Obtener productos por stantId
router.get("/products/:id/unidades", ProductoController.findUnidades); // Obtener unidades de un producto por ID
router.get(
  "/buscar-entrega-producto",
  ProductoController.buscarEntregaPorProducto
);

module.exports = router;
