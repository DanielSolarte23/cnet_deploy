const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.Controller');

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para el registro, inicio y verificación de cuentas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Cuenta:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: dansol
 *         tipo:
 *           type: string
 *           enum: [usuario, personal]
 *           example: usuario
 *         referenciaId:
 *           type: integer
 *           example: 10
 *
 *     RegistroRequest:
 *       type: object
 *       required:
 *         - tipo
 *         - username
 *         - password
 *       properties:
 *         tipo:
 *           type: string
 *           enum: [usuario, personal]
 *           example: usuario
 *         username:
 *           type: string
 *           example: dansol
 *         password:
 *           type: string
 *           example: 123456
 *         nombre:
 *           type: string
 *           example: Daniel Solarte
 *         cedula:
 *           type: string
 *           example: 1061913299
 *         telefono:
 *           type: string
 *           example: 3145655445
 *         correo:
 *           type: string
 *           example: daniel@gmail.com
 *         rol:
 *           type: string
 *           example: administrador
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: dansol
 *         password:
 *           type: string
 *           example: 123456
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Inicio de sesión exitoso
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         cuenta:
 *           $ref: '#/components/schemas/Cuenta'
 *         perfil:
 *           type: object
 *           example:
 *             id: 1
 *             nombre: Daniel Solarte
 *             cedula: 1061913299
 *             telefono: 3145655445
 *             rol: administrador
 */

/**
 * @swagger
 * /auth/registro:
 *   post:
 *     summary: Registra un nuevo usuario o personal
 *     tags: [Autenticación]
 *     description: Crea un registro en la tabla correspondiente (Usuario o Personal) y una cuenta asociada en la tabla Cuenta.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroRequest'
 *     responses:
 *       201:
 *         description: Cuenta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cuenta creada exitosamente
 *                 cuenta:
 *                   $ref: '#/components/schemas/Cuenta'
 *       400:
 *         description: Error en los datos enviados o tipo inválido
 */
router.post('/registro', authController.registro);

/**
 * @swagger
 * /auth/inicio:
 *   post:
 *     summary: Inicia sesión con credenciales válidas
 *     tags: [Autenticación]
 *     description: Valida las credenciales y genera un token JWT, además de guardar una cookie segura `jwt`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas
 *       400:
 *         description: Error en la solicitud
 */
router.post('/inicio', authController.inicio);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cierra sesión del usuario autenticado
 *     tags: [Autenticación]
 *     description: Limpia la cookie JWT en el navegador y finaliza la sesión actual.
 *     responses:
 *       200:
 *         description: Logout correcto
 *         content:
 *           application/json:
 *             example:
 *               message: Logout correcto
 *               success: true
 *       500:
 *         description: Error al cerrar sesión
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verifica la validez del token JWT
 *     tags: [Autenticación]
 *     description: Retorna la cuenta y el perfil asociado si el token JWT es válido.
 *     responses:
 *       200:
 *         description: Token válido, devuelve los datos de cuenta y perfil
 *         content:
 *           application/json:
 *             example:
 *               cuenta:
 *                 id: 1
 *                 username: dansol
 *                 tipo: usuario
 *               perfil:
 *                 id: 1
 *                 nombre: Daniel Solarte
 *                 correo: daniel@gmail.com
 *       401:
 *         description: Token no autorizado o inválido
 */
router.get('/verify', authController.verifyToken);

module.exports = router;
