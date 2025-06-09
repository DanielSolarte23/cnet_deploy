const {
  CategoriaController,
  SubcategoriaController,
} = require("../controllers/Categoria.Controller");
const express = require("express");
const router = express.Router();

// Rutas para categorías
router.post("/categorias", CategoriaController.create); // Crear una nueva categoría
router.get("/categorias", CategoriaController.findAll); // Obtener todas las categorías
router.get("/categorias/:id", CategoriaController.findOne); // Obtener una categoría por ID
router.put("/categorias/:id", CategoriaController.update); // Actualizar una categoría por ID
router.delete("/categorias/:id", CategoriaController.delete); // Eliminar una categoría por ID

router.post("/subcategorias", SubcategoriaController.create); // Crear una nueva subcategoría
router.get("/subcategorias", SubcategoriaController.findAll); // Obtener todas las subcategorías
router.get("/subcategoriasId/:id", SubcategoriaController.findOne); // Obtener una subcategoría por ID
router.get(
  "/subcategorias/categoria/:id",
  SubcategoriaController.findByCategoria
); // Obtener subcategorías por ID de categoría
router.put("/subcategorias/:id", SubcategoriaController.update); // Actualizar una subcategoría por ID
router.delete("/subcategorias/:id", SubcategoriaController.delete); // Eliminar una subcategoría por ID

module.exports = router;
