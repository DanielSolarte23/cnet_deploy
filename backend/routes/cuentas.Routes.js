const CuentasController = require("../controllers/cuentas.Controller");
const express = require("express");
const router = express.Router();

router.post("/crear-existentes", CuentasController.crearCuentasExistentes);
router.post("/crear-individual", CuentasController.crearIndividual);
router.put("/cuentas/:id", CuentasController.update);

module.exports = router;
