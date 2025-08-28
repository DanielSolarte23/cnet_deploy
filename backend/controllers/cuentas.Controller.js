const express = require("express");
// const router = express.Router();
const { Usuario, Personal, Cuenta } = require("../models"); // Ajusta la ruta según tu estructura

const CuentasController = {
  async crearCuentasExistentes(req, res) {
    try {
      const resultados = {
        usuarios: {
          total: 0,
          creados: 0,
          existentes: 0,
          errores: [],
        },
        personal: {
          total: 0,
          creados: 0,
          existentes: 0,
          errores: [],
        },
      };

      // Obtener todos los usuarios que no tienen cuenta
      const usuarios = await Usuario.findAll({
        include: [
          {
            model: Cuenta,
            required: false,
            where: { tipo: "usuario" },
          },
        ],
      });

      resultados.usuarios.total = usuarios.length;

      // Crear cuentas para usuarios
      for (const usuario of usuarios) {
        try {
          // Verificar si ya tiene cuenta
          const cuentaExistente = await Cuenta.findOne({
            where: {
              tipo: "usuario",
              referenciaId: usuario.id,
            },
          });

          if (cuentaExistente) {
            resultados.usuarios.existentes++;
            continue;
          }

          // Generar email basado en cédula o nombre
          let email = `${usuario.cedula}@colombianet.com`;

          // Verificar que el email no exista
          let contador = 1;
          let emailFinal = email;
          while (await Cuenta.findOne({ where: { email: emailFinal } })) {
            emailFinal = `${usuario.cedula}_${contador}@colombianet.com`;
            contador++;
          }

          // Crear cuenta con contraseña temporal basada en cédula
          await Cuenta.create({
            email: emailFinal,
            password: usuario.cedula, // Contraseña temporal (será hasheada por el hook)
            tipo: "usuario",
            referenciaId: usuario.id,
            activo: true,
          });

          resultados.usuarios.creados++;
        } catch (error) {
          resultados.usuarios.errores.push({
            usuarioId: usuario.id,
            nombre: usuario.nombre,
            error: error.message,
          });
        }
      }

      // Obtener todo el personal que no tiene cuenta
      const personal = await Personal.findAll({
        include: [
          {
            model: Cuenta,
            required: false,
            where: { tipo: "personal" },
          },
        ],
      });

      resultados.personal.total = personal.length;

      // Crear cuentas para personal
      for (const persona of personal) {
        try {
          // Verificar si ya tiene cuenta
          const cuentaExistente = await Cuenta.findOne({
            where: {
              tipo: "personal",
              referenciaId: persona.id,
            },
          });

          if (cuentaExistente) {
            resultados.personal.existentes++;
            continue;
          }

          // Generar email basado en nombre y apellido o cédula
          let baseEmail =
            persona.nombre && persona.apellido
              ? `${persona.nombre.toLowerCase()}.${persona.apellido.toLowerCase()}`
              : persona.cedula;

          let email = `${baseEmail}@colombianet.com`;

          // Verificar que el email no exista
          let contador = 1;
          let emailFinal = email;
          while (await Cuenta.findOne({ where: { email: emailFinal } })) {
            emailFinal = `${baseEmail}_${contador}@colombianet.com`;
            contador++;
          }

          // Crear cuenta con contraseña temporal basada en cédula
          await Cuenta.create({
            email: emailFinal,
            password: persona.cedula, // Contraseña temporal (será hasheada por el hook)
            tipo: "personal",
            referenciaId: persona.id,
            activo: persona.activo,
          });

          resultados.personal.creados++;
        } catch (error) {
          resultados.personal.errores.push({
            personalId: persona.id,
            nombre: `${persona.nombre} ${persona.apellido}`,
            error: error.message,
          });
        }
      }

      // Respuesta con resumen
      res.status(200).json({
        message: "Proceso de creación de cuentas completado",
        resultados,
        resumen: {
          totalUsuarios: resultados.usuarios.total,
          cuentasUsuariosCreadas: resultados.usuarios.creados,
          usuariosConCuentaExistente: resultados.usuarios.existentes,
          totalPersonal: resultados.personal.total,
          cuentasPersonalCreadas: resultados.personal.creados,
          personalConCuentaExistente: resultados.personal.existentes,
          errores:
            resultados.usuarios.errores.length +
            resultados.personal.errores.length,
        },
      });
    } catch (error) {
      console.error("Error al crear cuentas:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  },

  async crearIndividual(req, res) {
    try {
      const { tipo, referenciaId, email, password } = req.body;

      // Validaciones
      if (!tipo || !referenciaId) {
        return res.status(400).json({
          message: "Tipo y referenciaId son requeridos",
        });
      }

      if (!["usuario", "personal"].includes(tipo)) {
        return res.status(400).json({
          message: 'Tipo debe ser "usuario" o "personal"',
        });
      }

      // Verificar que el registro de referencia existe
      let registro;
      if (tipo === "usuario") {
        registro = await Usuario.findByPk(referenciaId);
      } else {
        registro = await Personal.findByPk(referenciaId);
      }

      if (!registro) {
        return res.status(404).json({
          message: `${
            tipo === "usuario" ? "Usuario" : "Personal"
          } no encontrado`,
        });
      }

      // Verificar si ya tiene cuenta
      const cuentaExistente = await Cuenta.findOne({
        where: {
          tipo,
          referenciaId,
        },
      });

      if (cuentaExistente) {
        return res.status(409).json({
          message: "Ya existe una cuenta para este registro",
          cuenta: {
            email: cuentaExistente.email,
            activo: cuentaExistente.activo,
          },
        });
      }

      // Generar email si no se proporciona
      let emailFinal = email;
      if (!emailFinal) {
        if (tipo === "usuario") {
          emailFinal = `${registro.cedula}@colombianet.com`;
        } else {
          emailFinal =
            registro.nombre && registro.apellido
              ? `${registro.nombre.toLowerCase()}.${registro.apellido.toLowerCase()}@colombianet.com`
              : `${registro.cedula}@colombianet.com`;
        }
      }

      // Verificar que el email no esté en uso
      const emailEnUso = await Cuenta.findOne({ where: { email: emailFinal } });
      if (emailEnUso) {
        return res.status(409).json({
          message: "El email ya está en uso",
        });
      }

      // Crear cuenta
      const nuevaCuenta = await Cuenta.create({
        email: emailFinal,
        password: password || registro.cedula, // Usa la contraseña proporcionada o la cédula como temporal
        tipo,
        referenciaId,
        activo: tipo === "personal" ? registro.activo : true,
      });

      res.status(201).json({
        message: "Cuenta creada exitosamente",
        cuenta: {
          id: nuevaCuenta.id,
          email: nuevaCuenta.email,
          tipo: nuevaCuenta.tipo,
          activo: nuevaCuenta.activo,
          referenciaId: nuevaCuenta.referenciaId,
        },
      });
    } catch (error) {
      console.error("Error al crear cuenta individual:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Cuenta.update(req.body, {
        where: { id },
      });

      if (updated) {
        const cuenta = await Cuenta.findByPk(id);
        return res.status(200).json({
          success: true,
          message: "Cuenta actualizada correctamente",
          data: cuenta,
        });
      }

      return res.status(404).json({
        success: false,
        message: "cuenta no encontrada",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Error al actualizar la cuenta",
        error: error.message,
      });
    }
  },
};

module.exports = CuentasController;
