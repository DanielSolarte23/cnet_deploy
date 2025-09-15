const db = require('../models');
const Notificacion = db.Notificacion;
const Usuario = db.Usuario;
const Producto = db.Producto;

const NotificacionController = {
  // Obtener todas las notificaciones
  async findAll(req, res) {
    try {
      const notificaciones = await Notificacion.findAll({
        include: [
          { model: Usuario, as: 'destinatario', attributes: ['id', 'nombre', 'rol'] },
          { model: Producto, as: 'producto', attributes: ['id', 'descripcion', 'codigo', 'stock', 'stockMinimo'] }
        ],
        order: [['fechaGeneracion', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        count: notificaciones.length,
        data: notificaciones
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener las notificaciones',
        error: error.message
      });
    }
  },

  // Obtener notificaciones por usuario
  async findByUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      const notificaciones = await Notificacion.findAll({
        where: {
          [db.Sequelize.Op.or]: [
            { usuarioId },
            { usuarioId: null } // Notificaciones generales
          ]
        },
        include: [
          { model: Producto, as: 'producto', attributes: ['id', 'descripcion', 'codigo', 'stock', 'stockMinimo'] }
        ],
        order: [['fechaGeneracion', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        count: notificaciones.length,
        data: notificaciones
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener las notificaciones',
        error: error.message
      });
    }
  },

  // Marcar notificación como leída
  async marcarLeida(req, res) {
    try {
      const { id } = req.params;
      const notificacion = await Notificacion.findByPk(id);
      
      if (!notificacion) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }
      
      notificacion.leida = true;
      notificacion.fechaLectura = new Date();
      await notificacion.save();
      
      return res.status(200).json({
        success: true,
        message: 'Notificación marcada como leída',
        data: notificacion
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error al actualizar la notificación',
        error: error.message
      });
    }
  },

  // Marcar todas las notificaciones como leídas
  async marcarTodasLeidas(req, res) {
    try {
      const { usuarioId } = req.params;
      
      await Notificacion.update(
        {
          leida: true,
          fechaLectura: new Date()
        },
        {
          where: {
            [db.Sequelize.Op.or]: [
              { usuarioId },
              { usuarioId: null } // Notificaciones generales
            ],
            leida: false
          }
        }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error al actualizar las notificaciones',
        error: error.message
      });
    }
  },

  // Crear notificación manual
  async create(req, res) {
    try {
      const notificacion = await Notificacion.create(req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Notificación creada correctamente',
        data: notificacion
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error al crear la notificación',
        error: error.message
      });
    }
  },

  // Eliminar notificación
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Notificacion.destroy({
        where: { id }
      });
      
      if (deleted) {
        return res.status(200).json({
          success: true,
          message: 'Notificación eliminada correctamente'
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar la notificación',
        error: error.message
      });
    }
  }
};

module.exports = NotificacionController;