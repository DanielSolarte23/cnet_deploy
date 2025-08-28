const db = require("../models");
const Personal = db.Personal;
const Entrega = db.Entrega;
const upload = require("../services/multer");
const fs = require("fs");
const path = require("path");

const PersonalController = {
  // Función auxiliar para manejar la carga de archivos
  handleFileUpload: (req, res) => {
    return new Promise((resolve, reject) => {
      upload.single("firma")(req, res, (err) => {
        if (err) {
          reject({
            status: 400,
            message: "Error al cargar la firma",
            error: err.message,
          });
        } else {
          resolve();
        }
      });
    });
  },

  // Función auxiliar para eliminar archivo
  deleteFile: (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error al eliminar archivo:", err);
      });
    }
  },

  // Crear un nuevo personal
  async create(req, res) {
    try {
      // Manejar la carga del archivo
      await PersonalController.handleFileUpload(req, res);

      // Preparar los datos del personal
      const personalData = { ...req.body };

      // Si se cargó una firma, agregar la ruta al objeto de datos
      if (req.file) {
        personalData.firma_path = req.file.path;
      }

      // Crear el registro del personal
      const personal = await Personal.create(personalData);

      return res.status(201).json({
        success: true,
        message: "Personal creado correctamente",
        data: personal,
      });
    } catch (error) {
      // Si hay error y se cargó un archivo, eliminarlo
      if (req.file) {
        PersonalController.deleteFile(req.file.path);
      }

      // Si el error viene del multer
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Error al crear el personal",
        error: error.message,
      });
    }
  },

  // Actualizar un personal
  async update(req, res) {
    try {
      const { id } = req.params;

      // Buscar el personal existente primero
      const personalExistente = await Personal.findByPk(id);
      if (!personalExistente) {
        return res.status(404).json({
          success: false,
          message: "Personal no encontrado",
        });
      }

      // Manejar la carga del archivo
      await PersonalController.handleFileUpload(req, res);

      const updateData = { ...req.body };
      let firmaAnterior = null;

      // Si se cargó una nueva firma
      if (req.file) {
        console.log("Nueva firma cargada:", req.file.path); // Debug
        firmaAnterior = personalExistente.firma_path;
        updateData.firma_path = req.file.path;
      }

      console.log("Datos a actualizar:", updateData); // Debug

      // Actualizar el personal
      const [updatedRows] = await Personal.update(updateData, {
        where: { id: id },
      });

      if (updatedRows === 0) {
        // Si no se actualizó y hay nuevo archivo, eliminarlo
        if (req.file) {
          PersonalController.deleteFile(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: "No se pudo actualizar el personal",
        });
      }

      // Si se actualizó correctamente y había firma anterior, eliminarla
      if (req.file && firmaAnterior) {
        PersonalController.deleteFile(firmaAnterior);
      }

      // Obtener el personal actualizado
      const personalActualizado = await Personal.findByPk(id);

      return res.status(200).json({
        success: true,
        message: "Personal actualizado correctamente",
        data: personalActualizado,
      });
    } catch (error) {
      // Si hay error y se cargó un archivo, eliminarlo
      if (req.file) {
        PersonalController.deleteFile(req.file.path);
      }

      // Si el error viene del multer
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Error al actualizar el personal",
        error: error.message,
      });
    }
  },

  // ... resto de métodos permanecen igual
  async findAll(req, res) {
    try {
      const personales = await Personal.findAll({
        order: [["nombre", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        count: personales.length,
        data: personales,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener el personal",
        error: error.message,
      });
    }
  },

  async findActive(req, res) {
    try {
      const personales = await Personal.findAll({
        where: { activo: true },
        order: [["nombre", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        count: personales.length,
        data: personales,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener el personal activo",
        error: error.message,
      });
    }
  },

  async findOne(req, res) {
    try {
      const { id } = req.params;
      const personal = await Personal.findByPk(id);

      if (!personal) {
        return res.status(404).json({
          success: false,
          message: "Personal no encontrado",
        });
      }

      return res.status(200).json({
        success: true,
        data: personal,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener el personal",
        error: error.message,
      });
    }
  },

  async getFirma(req, res) {
    try {
      const { id } = req.params;
      const personal = await Personal.findByPk(id);

      if (!personal) {
        return res.status(404).json({
          success: false,
          message: "Personal no encontrado",
        });
      }

      if (!personal.firma_path || !fs.existsSync(personal.firma_path)) {
        return res.status(404).json({
          success: false,
          message: "Firma no encontrada",
        });
      }

      res.sendFile(path.resolve(personal.firma_path));
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener la firma",
        error: error.message,
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const personal = await Personal.findByPk(id);

      if (!personal) {
        return res.status(404).json({
          success: false,
          message: "Personal no encontrado",
        });
      }

      // Eliminar archivo de firma si existe
      PersonalController.deleteFile(personal.firma_path);

      // Eliminar el registro
      await Personal.destroy({ where: { id: id } });

      return res.status(200).json({
        success: true,
        message: "Personal eliminado correctamente",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al eliminar el personal",
        error: error.message,
      });
    }
  },

  async getEntregas(req, res) {
    try {
      const { id } = req.params;
      const personal = await Personal.findByPk(id);

      if (!personal) {
        return res.status(404).json({
          success: false,
          message: "Personal no encontrado",
        });
      }

      const entregas = await Entrega.findAll({
        where: { personalId: id },
        include: [
          {
            model: db.EntregaProducto,
            include: [{ model: db.Producto }],
          },
          {
            model: db.Usuario,
            as: "almacenistaData",
            attributes: ["id", "nombre"],
          },
        ],
        order: [["fecha", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        count: entregas.length,
        data: {
          personal,
          entregas,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener las entregas del personal",
        error: error.message,
      });
    }
  },
};

module.exports = PersonalController;