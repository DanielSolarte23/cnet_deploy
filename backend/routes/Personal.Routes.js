const express = require("express");
const router = express.Router();
const PersonalController = require("../controllers/Personal.Controller");
const upload = require("../services/multer");

/**
 * @swagger
 * tags:
 *   name: Personal
 *   description: Endpoints para la gestión del personal del sistema
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Personal:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autoincremental del personal
 *         nombre:
 *           type: string
 *           description: Nombre completo del personal
 *         cedula:
 *           type: string
 *           description: Documento de identidad
 *         telefono:
 *           type: string
 *           description: Número de teléfono
 *         correo:
 *           type: string
 *           description: Correo electrónico
 *         cargo:
 *           type: string
 *           description: Cargo u ocupación dentro de la empresa
 *         activo:
 *           type: boolean
 *           description: Indica si el personal está activo
 *         firma_path:
 *           type: string
 *           nullable: true
 *           description: Ruta de la firma digital almacenada en el servidor
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 1
 *         nombre: "Daniel Solarte"
 *         cedula: "1061913299"
 *         telefono: "3145655445"
 *         correo: "daniel@gmail.com"
 *         cargo: "Administrador"
 *         activo: true
 *         firma_path: "uploads/firmas/daniel.png"
 *         createdAt: "2025-06-20T21:11:01.000Z"
 *         updatedAt: "2025-06-20T21:11:01.000Z"
 */

/**
 * @swagger
 * /personal:
 *   post:
 *     summary: Crea un nuevo registro de personal
 *     tags: [Personal]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               cedula:
 *                 type: string
 *               telefono:
 *                 type: string
 *               correo:
 *                 type: string
 *               cargo:
 *                 type: string
 *               activo:
 *                 type: boolean
 *               firma:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Personal creado correctamente
 *       400:
 *         description: Error al crear el personal
 */
router.post("/personal", upload.single("firma"), PersonalController.create);

/**
 * @swagger
 * /personal:
 *   get:
 *     summary: Obtiene todos los registros de personal
 *     tags: [Personal]
 *     responses:
 *       200:
 *         description: Lista de personal registrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Personal'
 */
router.get("/personal", PersonalController.findAll);

/**
 * @swagger
 * /personal/activo:
 *   get:
 *     summary: Obtiene solo el personal activo
 *     tags: [Personal]
 *     responses:
 *       200:
 *         description: Lista de personal activo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Personal'
 */
router.get("/personal/activo", PersonalController.findActive);

/**
 * @swagger
 * /personal/{id}/firma:
 *   get:
 *     summary: Obtiene el archivo de firma del personal
 *     tags: [Personal]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del personal
 *     responses:
 *       200:
 *         description: Firma obtenida correctamente
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Firma o personal no encontrado
 */
router.get("/personal/:id/firma", PersonalController.getFirma);

/**
 * @swagger
 * /personal/{id}:
 *   get:
 *     summary: Obtiene los datos de un personal por su ID
 *     tags: [Personal]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del personal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personal'
 *       404:
 *         description: Personal no encontrado
 */
router.get("/personal/:id", PersonalController.findOne);

/**
 * @swagger
 * /personal/{id}:
 *   put:
 *     summary: Actualiza los datos de un personal por su ID
 *     tags: [Personal]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               telefono:
 *                 type: string
 *               correo:
 *                 type: string
 *               activo:
 *                 type: boolean
 *               firma:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Personal actualizado correctamente
 *       400:
 *         description: Error al actualizar el personal
 *       404:
 *         description: Personal no encontrado
 */
router.put("/personal/:id", upload.single("firma"), PersonalController.update);

/**
 * @swagger
 * /personal/{id}:
 *   delete:
 *     summary: Elimina un personal por su ID
 *     tags: [Personal]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Personal eliminado correctamente
 *       404:
 *         description: Personal no encontrado
 */
router.delete("/personal/:id", PersonalController.delete);

/**
 * @swagger
 * /personal/entregas/{id}:
 *   get:
 *     summary: Obtiene todas las entregas asociadas a un personal
 *     tags: [Personal]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del personal
 *     responses:
 *       200:
 *         description: Entregas del personal
 *       404:
 *         description: Personal no encontrado
 */
router.get("/personal/entregas/:id", PersonalController.getEntregas);

module.exports = router;
