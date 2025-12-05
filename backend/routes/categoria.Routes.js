const express = require("express");
const router = express.Router();
const {
  CategoriaController,
  SubcategoriaController,
} = require("../controllers/Categoria.Controller");

/**
 * @swagger
 * tags:
 *   - name: Categorías
 *     description: Endpoints para la gestión de categorías
 *   - name: Subcategorías
 *     description: Endpoints para la gestión de subcategorías
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Categoria:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: Electrónica
 *         descripcion:
 *           type: string
 *           example: Productos tecnológicos y electrónicos
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Subcategoria:
 *       type: object
 *       required:
 *         - nombre
 *         - CategoriaId
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: Celulares
 *         CategoriaId:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /categorias:
 *   post:
 *     summary: Crea una nueva categoría
 *     tags: [Categorías]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Categoria'
 *     responses:
 *       201:
 *         description: Categoría creada correctamente
 *       400:
 *         description: Error al crear la categoría
 *
 *   get:
 *     summary: Obtiene todas las categorías
 *     tags: [Categorías]
 *     responses:
 *       200:
 *         description: Lista de todas las categorías
 *
 * /categorias/{id}:
 *   get:
 *     summary: Obtiene una categoría por ID
 *     tags: [Categorías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la categoría
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       404:
 *         description: Categoría no encontrada
 *   put:
 *     summary: Actualiza una categoría por ID
 *     tags: [Categorías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Categoria'
 *     responses:
 *       200:
 *         description: Categoría actualizada correctamente
 *       404:
 *         description: Categoría no encontrada
 *   delete:
 *     summary: Elimina una categoría por ID
 *     tags: [Categorías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría eliminada correctamente
 *       400:
 *         description: No se puede eliminar porque tiene subcategorías asociadas
 *       404:
 *         description: Categoría no encontrada
 */

/**
 * @swagger
 * /subcategorias:
 *   post:
 *     summary: Crea una nueva subcategoría
 *     tags: [Subcategorías]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subcategoria'
 *     responses:
 *       201:
 *         description: Subcategoría creada correctamente
 *       400:
 *         description: Error al crear la subcategoría
 *   get:
 *     summary: Obtiene todas las subcategorías
 *     tags: [Subcategorías]
 *     responses:
 *       200:
 *         description: Lista de todas las subcategorías
 *
 * /subcategoriasId/{id}:
 *   get:
 *     summary: Obtiene una subcategoría por ID
 *     tags: [Subcategorías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Subcategoría encontrada
 *       404:
 *         description: Subcategoría no encontrada
 *
 * /subcategorias/categoria/{id}:
 *   get:
 *     summary: Obtiene las subcategorías de una categoría específica
 *     tags: [Subcategorías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Subcategorías obtenidas correctamente
 *       404:
 *         description: No se encontraron subcategorías
 *
 * /subcategorias/{id}:
 *   put:
 *     summary: Actualiza una subcategoría por ID
 *     tags: [Subcategorías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subcategoria'
 *     responses:
 *       200:
 *         description: Subcategoría actualizada correctamente
 *       404:
 *         description: Subcategoría no encontrada
 *   delete:
 *     summary: Elimina una subcategoría por ID
 *     tags: [Subcategorías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Subcategoría eliminada correctamente
 *       400:
 *         description: No se puede eliminar porque tiene productos asociados
 *       404:
 *         description: Subcategoría no encontrada
 */

router.post("/categorias", CategoriaController.create);
router.get("/categorias", CategoriaController.findAll);
router.get("/categorias/:id", CategoriaController.findOne);
router.put("/categorias/:id", CategoriaController.update);
router.delete("/categorias/:id", CategoriaController.delete);

router.post("/subcategorias", SubcategoriaController.create);
router.get("/subcategorias", SubcategoriaController.findAll);
router.get("/subcategoriasId/:id", SubcategoriaController.findOne);
router.get("/subcategorias/categoria/:id", SubcategoriaController.findByCategoria);
router.put("/subcategorias/:id", SubcategoriaController.update);
router.delete("/subcategorias/:id", SubcategoriaController.delete);

module.exports = router;
