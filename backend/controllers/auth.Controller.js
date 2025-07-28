const jwt = require("jsonwebtoken");
const { Usuario } = require("../models");
const JWT_SECRET = "tu_secreto_jwt";

const authController = {
  async registro(req, res) {
    try {
      const { nombre, cedula, telefono, correo, username, password, rol } =
        req.body;

      const usuario = await Usuario.create({
        nombre,
        cedula,
        telefono,
        correo,
        username,
        password,
        rol,
      });

      res.status(201).json({
        message: "Usuario creado exitosamente",
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          cedula: usuario.cedula,
          telefono: usuario.telefono,
          correo: usuario.correo,
          username: usuario.username,
        },
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async inicio(req, res) {
    try {
      const { correo, password } = req.body;

      const usuario = await Usuario.findOne({ where: { correo } });
      if (!usuario) {
        return res.status(401).json({ message: "Credenciales invalidas" });
      }

      const isValidPassword = await usuario.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenciales invalidas" });
      }

      const token = jwt.sign({ id: usuario.id }, JWT_SECRET, {
        expiresIn: "1d",
      });

      // Configurar cookie con las mismas opciones que en el logout
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 día
        path: "/"
      });

      res.json({
        message: "Inicio de sesión exitoso",
        token: token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          username: usuario.username,
          rol: usuario.rol,
        },
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async logout(req, res) {
    try {
      // Limpiar la cookie httpOnly con las mismas opciones que cuando se creó
      res.cookie("jwt", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        expires: new Date(0), // Expirar inmediatamente
        path: "/"
      });
      
      res.status(200).json({ 
        message: "Logout correcto",
        success: true 
      });
    } catch (error) {
      console.error("Error en logout:", error);
      res.status(500).json({ 
        message: "Error al cerrar sesión",
        error: error.message 
      });
    }
  },

  async verifyToken(req, res) {
    try {
      const { jwt: token } = req.cookies;

      if (!token) {
        return res.status(401).json({ message: "No autorizado" });
      }

      jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "No autorizado" });
        }

        const usuarioEncontrado = await Usuario.findOne({
          where: { id: decoded.id },
        });
        if (!usuarioEncontrado) {
          return res.status(401).json({ message: "No autorizado" });
        }

        return res.json({
          id: usuarioEncontrado.id,
          nombre: usuarioEncontrado.nombre,
          cedula: usuarioEncontrado.cedula,
          telefono: usuarioEncontrado.telefono,
          correo: usuarioEncontrado.correo,
          username: usuarioEncontrado.username,
          rol: usuarioEncontrado.rol,
        });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = authController;