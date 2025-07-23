const ProductoController = require("../controllers/Productos.Controller");
const express = require("express");
const validateProductoCreate = require("../middlewares/validateProductoCreate");
const router = express.Router();

// Rutas para productos
router.post("/productos", validateProductoCreate, ProductoController.create); // Crear un nuevo producto
router.get("/productos", ProductoController.findAll); // Obtener todos los productos
router.get("/products", ProductoController.findAllLite); // Obtener todos los productos
router.get("/productos/:id", ProductoController.findOne); // Obtener un producto por ID
router.put("/productos/:id", ProductoController.update); // Actualizar un producto por ID
router.put("/productos/:id/stock", ProductoController.ajustarStock); // Actualizar stock de un producto por ID
router.get("/products/stock/bajo", ProductoController.getStockBajo); // Obtener productos con stock bajo
router.delete("/productos/:id", ProductoController.delete); // Eliminar un producto por ID
router.get("/products/stant/:stantId", ProductoController.findByStant); // Obtener productos por stantId
router.get("/products/:id/unidades", ProductoController.findUnidades); // Obtener unidades de un producto por ID

module.exports = router;
