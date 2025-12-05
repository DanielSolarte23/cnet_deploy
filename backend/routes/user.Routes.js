const express = require('express');
const router = express.Router();
const userController = require('../controllers/Usuario.Controller');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Operaciones CRUD para gestionar los usuarios del sistema
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - nombre
 *         - cedula
 *         - telefono
 *         - correo
 *         - username
 *         - password
 *         - rol
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
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
 *         username:
 *           type: string
 *           example: dansol
 *         password:
 *           type: string
 *           example: 123456
 *         rol:
 *           type: string
 *           example: administrador
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-06-20T21:11:01.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-06-20T21:11:01.000Z
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtiene todos los usuarios registrados
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 */
router.get('/usuarios', userController.getUsuarios);

/**
 * @swagger
 * /usuario/{id}:
 *   get:
 *     summary: Obtiene un usuario específico por su ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/usuario/:id', userController.getUsuarioById);

/**
 * @swagger
 * /usuario:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *           example:
 *             nombre: Daniel Solarte
 *             cedula: "1061913299"
 *             telefono: "3145655445"
 *             correo: daniel@gmail.com
 *             username: dansol
 *             password: 123456
 *             rol: administrador
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Error en los datos enviados
 */
router.post('/usuario', userController.crearUsuario);

/**
 * @swagger
 * /usuario/{id}:
 *   put:
 *     summary: Actualiza los datos de un usuario existente
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *           example:
 *             nombre: Daniel A. Solarte
 *             telefono: "3121234567"
 *             rol: administrador
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/usuario/:id', userController.updateUsuario);

/**
 * @swagger
 * /usuario/{id}:
 *   delete:
 *     summary: Elimina un usuario por su ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/usuario/:id', userController.deleteUsuario);

module.exports = router;
