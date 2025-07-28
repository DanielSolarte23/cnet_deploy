const EntregaController = require("../controllers/Entrega.Controller");
const ActaController = require("../controllers/acta.Controller");
const express = require("express");
const router = express.Router();

// Rutas para la entidad Entrega
router.post("/entrega", EntregaController.create); // Crear una nueva entrega
router.get("/entrega", EntregaController.findAll); // Obtener todas las entregas
router.get("/entrega/:id", EntregaController.findOne); // Obtener una entrega por ID
router.get("/entrega/filtro", EntregaController.findByFilters); // Obtener entregas por filtro
// router.put('/entregas/:id/productos', EntregaController.updateProductos);
router.put("/entrega/:id", EntregaController.update); // Actualizar una entrega por ID
router.delete("/entrega/:id", EntregaController.delete); // Eliminar una entrega por ID
// router.patch('/entrega/:id', EntregaController.actualizarEstadoEntrega); // Actualizar parcialmente una entrega por ID */
// Agregar esta ruta a tu router
router.get('/entregas/confirmar-entrega/:token', EntregaController.confirmEntrega);
// Rutas para la generación de actas
router.get("/entregas/:id/acta", ActaController.generarActa);
router.get("/entregas/:id/acta/preview", ActaController.vistaPrevia);

module.exports = router;
