const productosAsignadosController = require("../controllers/ProductosAsignados.Controller");
const express = require("express");
const router = express.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     ProductoAsignado:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del producto asignado
 *         productoId:
 *           type: integer
 *           description: ID del producto
 *         unidadId:
 *           type: integer
 *           description: ID de la unidad seriada (si aplica)
 *         serial:
 *           type: string
 *           description: Número de serie de la unidad
 *         personalId:
 *           type: integer
 *           description: ID del personal asignado
 *         proyectoId:
 *           type: integer
 *           description: ID del proyecto (si aplica)
 *         entregaId:
 *           type: integer
 *           description: ID de la entrega
 *         cantidad:
 *           type: integer
 *           description: Cantidad asignada
 *         fechaAsignacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de asignación
 *         fechaDevolucion:
 *           type: string
 *           format: date-time
 *           description: Fecha de devolución (si aplica)
 *         estado:
 *           type: string
 *           enum: [asignado, devuelto, instalado, en_uso]
 *           description: Estado del producto asignado
 *         observaciones:
 *           type: string
 *           description: Observaciones adicionales
 *         Producto:
 *           type: object
 *           description: Información del producto
 *           properties:
 *             id:
 *               type: integer
 *             codigo:
 *               type: string
 *             descripcion:
 *               type: string
 *             marca:
 *               type: string
 *             modelo:
 *               type: string
 *         Personal:
 *           type: object
 *           description: Información del personal asignado
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *             apellido:
 *               type: string
 *             cargo:
 *               type: string
 * 
 *     BusquedaGlobalResultado:
 *       type: object
 *       properties:
 *         tipoResultado:
 *           type: string
 *           enum: [producto_asignado, entrega, personal]
 *           description: Tipo de resultado encontrado
 *         id:
 *           type: integer
 *           description: ID del registro
 *         relevancia:
 *           type: integer
 *           description: Puntuación de relevancia
 *         coincidencias:
 *           type: object
 *           description: Campos donde se encontró coincidencia
 *           properties:
 *             serial:
 *               type: boolean
 *             descripcion:
 *               type: boolean
 *             codigo:
 *               type: boolean
 *             personal:
 *               type: boolean
 *             proyecto:
 *               type: boolean
 *         datos:
 *           type: object
 *           description: Datos del registro encontrado
 * 
 *     BusquedaRapidaSugerencia:
 *       type: object
 *       properties:
 *         valor:
 *           type: string
 *           description: Valor de la sugerencia
 *         tipo:
 *           type: string
 *           enum: [serial, producto, personal, proyecto]
 *           description: Tipo de sugerencia
 *         icono:
 *           type: string
 *           description: Nombre del icono sugerido
 *         id:
 *           type: integer
 *           description: ID del registro
 *         contexto:
 *           type: string
 *           description: Información adicional de contexto
 */

/**
 * @swagger
 * /api/productos-asignados/buscar:
 *   get:
 *     summary: Búsqueda global de productos asignados
 *     tags: [Productos Asignados]
 *     description: |
 *       Realiza una búsqueda exhaustiva en productos asignados, entregas y personal.
 *       Busca coincidencias en seriales, descripciones, códigos, nombres de personal y proyectos.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Término de búsqueda
 *         example: "router"
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número máximo de resultados a devolver
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [todos, asignados, entregas, personal]
 *           default: todos
 *         description: Filtrar por tipo de resultado
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [asignado, devuelto, instalado, en_uso]
 *         description: Filtrar por estado de asignación
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar desde fecha (YYYY-MM-DD)
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar hasta fecha (YYYY-MM-DD)
 *       - in: query
 *         name: ordenarPor
 *         schema:
 *           type: string
 *           enum: [relevancia, fecha, alfabetico]
 *           default: relevancia
 *         description: Criterio de ordenamiento
 *     responses:
 *       200:
 *         description: Resultados de búsqueda encontrados
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
 *                     $ref: '#/components/schemas/BusquedaGlobalResultado'
 *                 estadisticas:
 *                   type: object
 *                   properties:
 *                     totalEncontrados:
 *                       type: integer
 *                       description: Total de resultados
 *                     porTipo:
 *                       type: object
 *                       properties:
 *                         productosAsignados:
 *                           type: integer
 *                         entregas:
 *                           type: integer
 *                         personal:
 *                           type: integer
 *                     terminoBusqueda:
 *                       type: string
 *                     tiempoRespuesta:
 *                       type: string
 *                       format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     limite:
 *                       type: integer
 *                     hayMasResultados:
 *                       type: boolean
 *                     filtrosAplicados:
 *                       type: object
 *             examples:
 *               busquedaExitosa:
 *                 summary: Búsqueda exitosa
 *                 value:
 *                   success: true
 *                   data:
 *                     - tipoResultado: "producto_asignado"
 *                       id: 123
 *                       relevancia: 95
 *                       coincidencias:
 *                         serial: true
 *                         descripcion: false
 *                       datos:
 *                         serial: "SN123456"
 *                         producto: "Router TP-Link"
 *                         personal: "Juan Pérez"
 *                         estado: "asignado"
 *                   estadisticas:
 *                     totalEncontrados: 15
 *                     porTipo:
 *                       productosAsignados: 10
 *                       entregas: 3
 *                       personal: 2
 *       400:
 *         description: Parámetros de búsqueda inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Debe proporcionar un término de búsqueda"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/productos-asignados/busqueda-rapida:
 *   get:
 *     summary: Búsqueda rápida y autocompletado de productos asignados
 *     tags: [Productos Asignados]
 *     description: |
 *       Proporciona sugerencias rápidas para autocompletado mientras el usuario escribe.
 *       Ideal para campos de búsqueda con autocompletado en tiempo real.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Término de búsqueda (mínimo 2 caracteres)
 *         example: "ro"
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Número máximo de sugerencias
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [todos, serial, producto, personal, proyecto]
 *           default: todos
 *         description: Filtrar sugerencias por tipo
 *       - in: query
 *         name: soloActivos
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Solo mostrar productos actualmente asignados
 *     responses:
 *       200:
 *         description: Lista de sugerencias para autocompletado
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
 *                     $ref: '#/components/schemas/BusquedaRapidaSugerencia'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     termino:
 *                       type: string
 *                       description: Término buscado
 *                     total:
 *                       type: integer
 *                       description: Total de sugerencias devueltas
 *                     tiposFiltrados:
 *                       type: array
 *                       items:
 *                         type: string
 *             examples:
 *               sugerenciasExitosas:
 *                 summary: Sugerencias encontradas
 *                 value:
 *                   success: true
 *                   data:
 *                     - valor: "SN001234"
 *                       tipo: "serial"
 *                       icono: "hash"
 *                       id: 45
 *                       contexto: "Router Cisco - Juan Pérez"
 *                     - valor: "Router TP-Link AC1200"
 *                       tipo: "producto"
 *                       icono: "package"
 *                       id: 78
 *                       contexto: "3 asignaciones activas"
 *                     - valor: "Juan Pérez"
 *                       tipo: "personal"
 *                       icono: "user"
 *                       id: 12
 *                       contexto: "Técnico - 5 productos asignados"
 *                   meta:
 *                     termino: "ro"
 *                     total: 3
 *               sinResultados:
 *                 summary: Sin sugerencias
 *                 value:
 *                   success: true
 *                   data: []
 *                   meta:
 *                     termino: "xyz"
 *                     total: 0
 *                   message: "No se encontraron sugerencias"
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Mínimo 2 caracteres para búsqueda rápida"
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/productos-asignados:
 *   get:
 *     summary: Obtener todos los productos asignados
 *     tags: [Productos Asignados]
 *     description: |
 *       Retorna una lista completa o filtrada de todos los productos asignados.
 *       Incluye información del producto, personal asignado y estado actual.
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [asignado, devuelto, instalado, en_uso, todos]
 *           default: todos
 *         description: Filtrar por estado
 *       - in: query
 *         name: personalId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de personal
 *       - in: query
 *         name: proyectoId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de proyecto
 *       - in: query
 *         name: productoId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de producto
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar desde fecha (YYYY-MM-DD)
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar hasta fecha (YYYY-MM-DD)
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 100
 *           minimum: 1
 *           maximum: 1000
 *         description: Número de registros por página
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Número de página
 *       - in: query
 *         name: ordenarPor
 *         schema:
 *           type: string
 *           enum: [fecha, producto, personal, estado]
 *           default: fecha
 *         description: Campo para ordenar
 *       - in: query
 *         name: orden
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Orden ascendente o descendente
 *     responses:
 *       200:
 *         description: Lista de productos asignados
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
 *                     $ref: '#/components/schemas/ProductoAsignado'
 *                 paginacion:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total de registros
 *                     pagina:
 *                       type: integer
 *                       description: Página actual
 *                     limite:
 *                       type: integer
 *                       description: Registros por página
 *                     totalPaginas:
 *                       type: integer
 *                       description: Total de páginas
 *                 filtros:
 *                   type: object
 *                   description: Filtros aplicados
 *             examples:
 *               listadoCompleto:
 *                 summary: Listado con paginación
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: 1
 *                       serial: "SN001"
 *                       estado: "asignado"
 *                       fechaAsignacion: "2025-01-15T10:30:00Z"
 *                       Producto:
 *                         codigo: "PRD-0001"
 *                         descripcion: "Router Cisco"
 *                       Personal:
 *                         nombre: "Juan"
 *                         apellido: "Pérez"
 *                   paginacion:
 *                     total: 250
 *                     pagina: 1
 *                     limite: 100
 *                     totalPaginas: 3
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * tags:
 *   name: Productos Asignados
 *   description: |
 *     API para gestión y búsqueda de productos asignados a personal o proyectos.
 *     Permite rastrear el estado y ubicación de productos en el inventario.
 */

router.get(
  "/productos-asignados/buscar",
  productosAsignadosController.buscarProductosGlobal
);
router.get(
  "/productos-asignados/busqueda-rapida",
  productosAsignadosController.busquedaRapida
);
router.get("/productos-asignados");

module.exports = router;
