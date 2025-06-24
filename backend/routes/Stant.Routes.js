const StantController = require("../controllers/Stant.Controller");
const express = require("express");
const router = express.Router();

// Crear un nuevo estante
router.post("/stant", StantController.create);
// Obtener todos los estantes
router.get("/stants", StantController.findAll);
// Obtener un estante por ID
router.get("/stant/:id", StantController.findOne);
// Actualizar un estante por ID
router.put("/stant/:id", StantController.update);

router.delete("/stant/:id", StantController.delete)

module.exports = router;
