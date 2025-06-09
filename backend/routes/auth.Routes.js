const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.Controller');
const authMiddleware = require('../middlewares/authMiddleware');

// router.get('/perfil',  authController.getProfile)
router.post('/registro', authController.registro);
router.post('/inicio', authController.inicio);
router.post('/logout', authMiddleware, authController.logout);
router.get('/verify', authController.verifyToken);

module.exports = router;