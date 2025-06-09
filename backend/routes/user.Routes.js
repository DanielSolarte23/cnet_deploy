const express = require('express');
const router = express.Router();
const userController = require('../controllers/usuario.Controller');

router.get('/usuarios', userController.getUsuarios);
router.get('/usuario/:id', userController.getUsuarioById);
router.post('/usuario', userController.crearUsuario);
router.put('/usuario/:id', userController.updateUsuario);
router.delete('/usuario/:id', userController.deleteUsuario);

module.exports = router;
