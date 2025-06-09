const ReintegroController = require('../controllers/Reintegro.Controller');
const express = require('express');
const router = express.Router();



// Rutas para el controlador de reintegros
router.post('/reintegro', ReintegroController.create); // Crear un nuevo reintegro
router.get('/reintegro', ReintegroController.findAll); // Obtener todos los reintegros
router.get('/reintegro/:id', ReintegroController.findOne); // Obtener un reintegro por ID
router.put('/reintegro/:id', ReintegroController.update); // Actualizar un reintegro por ID
router.delete('/reintegro/:id', ReintegroController.delete); // Eliminar un reintegro por ID
router.get('/reintegro/filtro', ReintegroController.findByFilters); // Filtrar reintegros por fecha y monto
router.get('/reintegro/verificar/:id', ReintegroController.verificar); // Verificar si un reintegro existe por ID

module.exports = router;