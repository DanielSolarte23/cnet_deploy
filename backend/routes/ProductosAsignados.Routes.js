const productosAsignadosController = require("../controllers/ProductosAsignados.Controller");
const express = require("express");
const router = express.Router();

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
