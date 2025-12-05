const express = require("express");
const router = express.Router();
const CuentasController = require("../controllers/cuentas.Controller");

/**
 * @swagger
 * tags:
 *   - name: Cuentas
 *     description: Endpoints para la gestión y creación de cuentas de usuario y personal
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Cuenta:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - tipo
 *         - referenciaId
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         email:
 *           type: string
 *           example: usuario@colombianet.com
 *         password:
 *           type: string
 *           example: "123456"
 *         tipo:
 *           type: string
 *           enum: [usuario, personal]
 *           example: usuario
 *         referenciaId:
 *           type: integer
 *           example: 2
 *         activo:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /crear-existentes:
 *   post:
 *     summary: Crea automáticamente cuentas para todos los usuarios y personal que no las tengan
 *     tags: [Cuentas]
 *     description: Este endpoint genera cuentas de tipo "usuario" o "personal" automáticamente, asignando correos basados en la cédula o nombre, y contraseñas temporales.
 *     responses:
 *       200:
 *         description: Proceso completado, se devuelve un resumen con los resultados
 *         content:
 *           application/json:
 *             example:
 *               message: "Proceso de creación de cuentas completado"
 *               resultados:
 *                 usuarios:
 *                   total: 10
 *                   creados: 5
 *                   existentes: 5
 *                 personal:
 *                   total: 3
 *                   creados: 3
 *                   existentes: 0
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /crear-individual:
 *   post:
 *     summary: Crea una cuenta individual para un usuario o personal
 *     tags: [Cuentas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - referenciaId
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [usuario, personal]
 *                 example: usuario
 *               referenciaId:
 *                 type: integer
 *                 example: 1
 *               email:
 *                 type: string
 *                 example: daniel.solarte@colombianet.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: Cuenta creada exitosamente
 *         content:
 *           application/json:
 *             example:
 *               message: "Cuenta creada exitosamente"
 *               cuenta:
 *                 id: 12
 *                 email: daniel.solarte@colombianet.com
 *                 tipo: usuario
 *                 activo: true
 *                 referenciaId: 1
 *       400:
 *         description: Faltan datos requeridos o tipo inválido
 *       404:
 *         description: Usuario o personal no encontrado
 *       409:
 *         description: Ya existe una cuenta para este registro o el email está en uso
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /cuentas/{id}:
 *   put:
 *     summary: Actualiza una cuenta por ID
 *     tags: [Cuentas]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la cuenta
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cuenta'
 *     responses:
 *       200:
 *         description: Cuenta actualizada correctamente
 *       404:
 *         description: Cuenta no encontrada
 *       400:
 *         description: Error en la solicitud o en la actualización
 */

router.post("/crear-existentes", CuentasController.crearCuentasExistentes);
router.post("/crear-individual", CuentasController.crearIndividual);
router.put("/cuentas/:id", CuentasController.update);

module.exports = router;
