const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Cuenta, Usuario, Personal } = require("../models");
const JWT_SECRET = process.env.JWT_SECRET || "tu_secreto_jwt";

const authController = {

  async registro(req, res) {
    try {
      const { tipo, username, password, ...resto } = req.body;

      if (!["usuario", "personal"].includes(tipo)) {
        return res.status(400).json({ message: "Tipo inválido" });
      }

      // 1. Crear registro en la tabla correspondiente
      let referencia;
      if (tipo === "usuario") {
        referencia = await Usuario.create(resto);
      } else if (tipo === "personal") {
        referencia = await Personal.create(resto);
      }

      // 2. Crear cuenta de login
      const cuenta = await Cuenta.create({
        username,
        password,
        tipo,
        referenciaId: referencia.id,
      });

      res.status(201).json({
        message: "Cuenta creada exitosamente",
        cuenta: {
          id: cuenta.id,
          username: cuenta.username,
          tipo: cuenta.tipo,
          referenciaId: cuenta.referenciaId,
        },
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },


  async inicio(req, res) {
    try {
      const { username, password } = req.body;

      const cuenta = await Cuenta.findOne({ where: { username } });
      if (!cuenta) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const isValidPassword = await bcrypt.compare(password, cuenta.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Generar JWT
      const token = jwt.sign(
        { id: cuenta.id, tipo: cuenta.tipo },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });

      // Traer datos del perfil (usuario o personal)
      let perfil = null;
      if (cuenta.tipo === "usuario") {
        perfil = await Usuario.findByPk(cuenta.referenciaId);
      } else if (cuenta.tipo === "personal") {
        perfil = await Personal.findByPk(cuenta.referenciaId);
      }

      res.json({
        message: "Inicio de sesión exitoso",
        token,
        cuenta: {
          id: cuenta.id,
          username: cuenta.username,
          tipo: cuenta.tipo,
        },
        perfil,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Logout
  async logout(req, res) {
    try {
      res.cookie("jwt", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        expires: new Date(0),
        path: "/",
      });

      res.status(200).json({
        message: "Logout correcto",
        success: true,
      });
    } catch (error) {
      console.error("Error en logout:", error);
      res.status(500).json({
        message: "Error al cerrar sesión",
        error: error.message,
      });
    }
  },

  // Verificar token
  async verifyToken(req, res) {
    try {
      const { jwt: token } = req.cookies;

      if (!token) {
        return res.status(401).json({ message: "No autorizado" });
      }

      jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Token inválido" });
        }

        const cuenta = await Cuenta.findByPk(decoded.id);
        if (!cuenta) {
          return res.status(401).json({ message: "No autorizado" });
        }

        let perfil = null;
        if (cuenta.tipo === "usuario") {
          perfil = await Usuario.findByPk(cuenta.referenciaId);
        } else if (cuenta.tipo === "personal") {
          perfil = await Personal.findByPk(cuenta.referenciaId);
        }

        return res.json({
          cuenta: {
            id: cuenta.id,
            username: cuenta.username,
            tipo: cuenta.tipo,
          },
          perfil,
        });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = authController;
