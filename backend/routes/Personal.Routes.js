const PersonalController = require("../controllers/Personal.Controller");
const express = require("express");
const router = express.Router();

//rutas
router.post("/personal", PersonalController.create); // Crear un nuevo personal
router.get("/personal", PersonalController.findAll); // Obtener todos los personales
router.get("/personal/activo", PersonalController.findActive); // Obtener personal activo
router.get("/personal/:id", PersonalController.findOne); // Obtener personal por ID
router.put("/personal/:id", PersonalController.update); // Actualizar personal por ID
router.delete("/personal/:id", PersonalController.delete); // Eliminar personal por ID
router.get("/personal/entregas/:id", PersonalController.getEntregas); // Obtener entregas por ID de personal

module.exports = router;