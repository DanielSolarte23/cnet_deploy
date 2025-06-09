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

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 1 día
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
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.json({ message: "logout correcto" });
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
          rol: usuarioEncontrado.rol,
        });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = authController;
