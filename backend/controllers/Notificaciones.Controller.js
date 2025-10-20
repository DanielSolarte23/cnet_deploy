const db = require('../models');
const Notificacion = db.Notificacion;
const Usuario = db.Usuario;
const Producto = db.Producto;
const Personal = db.Personal;
const notificationService = require('../services/NotificationService');

const NotificacionController = {
  // Obtener todas las notificaciones
  async findAll(req, res) {
    try {
      const notificaciones = await Notificacion.findAll({
        include: [
          { 
            model: Usuario, 
            as: 'destinatario', 
            attributes: ['id', 'nombre'] 
          },
          { 
            model: Producto, 
            as: 'producto', 
            attributes: ['id', 'descripcion', 'codigo', 'stock', 'stockMinimo'] 
          },
          { 
            model: Personal, 
            as: 'personal', 
            attributes: ['id', 'nombre', 'apellido', 'cargo', 'correo'] 
          }
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
      const { leidas, limit = 50, offset = 0 } = req.query;

      const whereClause = {
        [db.Sequelize.Op.or]: [
          { usuarioId: parseInt(usuarioId) },
          { usuarioId: null } // Notificaciones generales
        ]
      };

      // Filtrar por estado de lectura si se especifica
      if (leidas !== undefined) {
        whereClause.leida = leidas === 'true';
      }

      const notificaciones = await Notificacion.findAll({
        where: whereClause,
        include: [
          { 
            model: Producto, 
            as: 'producto', 
            attributes: ['id', 'descripcion', 'codigo', 'stock', 'stockMinimo'] 
          },
          { 
            model: Personal, 
            as: 'personal', 
            attributes: ['id', 'nombre', 'apellido', 'cargo'] 
          }
        ],
        order: [['fechaGeneracion', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
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

  // Obtener notificaciones por personal
  async findByPersonal(req, res) {
    try {
      const { personalId } = req.params;
      const { leidas, limit = 50, offset = 0 } = req.query;

      // Construir whereClause correctamente
      let whereClause = {
        personalId: parseInt(personalId)
      };

      // Filtrar por estado de lectura si se especifica
      if (leidas !== undefined) {
        whereClause.leida = leidas === 'true';
      }

      const notificaciones = await Notificacion.findAll({
        where: whereClause,
        include: [
          { 
            model: Producto, 
            as: 'producto', 
            attributes: ['id', 'descripcion', 'codigo', 'stock', 'stockMinimo'] 
          },
          { 
            model: Usuario, 
            as: 'destinatario', 
            attributes: ['id', 'nombre', 'rol'] 
          }
        ],
        order: [['fechaGeneracion', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      return res.status(200).json({
        success: true,
        count: notificaciones.length,
        data: notificaciones
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener las notificaciones del personal',
        error: error.message
      });
    }
  },

  // Obtener contador de notificaciones no leídas por usuario
  async getUnreadCountByUsuario(req, res) {
    try {
      const { usuarioId } = req.params;

      const count = await Notificacion.count({
        where: {
          [db.Sequelize.Op.or]: [
            { usuarioId: parseInt(usuarioId) },
            { usuarioId: null }
          ],
          leida: false
        }
      });
      
      return res.status(200).json({
        success: true,
        count
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener el contador de notificaciones',
        error: error.message
      });
    }
  },

  // Obtener contador de notificaciones no leídas por personal
  async getUnreadCountByPersonal(req, res) {
    try {
      const { personalId } = req.params;

      const count = await Notificacion.count({
        where: {
          personalId: parseInt(personalId),
          leida: false
        }
      });
      
      return res.status(200).json({
        success: true,
        count
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener el contador de notificaciones',
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
      
      if (!notificacion.leida) {
        notificacion.leida = true;
        notificacion.fechaLectura = new Date();
        await notificacion.save();
      }
      
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

  // Marcar todas las notificaciones como leídas para usuario
  async marcarTodasLeidasUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      
      const [updatedCount] = await Notificacion.update(
        {
          leida: true,
          fechaLectura: new Date()
        },
        {
          where: {
            [db.Sequelize.Op.or]: [
              { usuarioId: parseInt(usuarioId) },
              { usuarioId: null } // Notificaciones generales
            ],
            leida: false
          }
        }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas',
        updatedCount
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error al actualizar las notificaciones',
        error: error.message
      });
    }
  },

  // Marcar todas las notificaciones como leídas para personal
  async marcarTodasLeidasPersonal(req, res) {
    try {
      const { personalId } = req.params;
      
      const [updatedCount] = await Notificacion.update(
        {
          leida: true,
          fechaLectura: new Date()
        },
        {
          where: {
            personalId: parseInt(personalId),
            leida: false
          }
        }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Todas las notificaciones del personal marcadas como leídas',
        updatedCount
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error al actualizar las notificaciones del personal',
        error: error.message
      });
    }
  },

  // Crear notificación manual
  async create(req, res) {
    try {
      const notificacion = await notificationService.createAndBroadcast(req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Notificación creada y enviada correctamente',
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
  },

  // Endpoint SSE para conexión en tiempo real
  async sseConnect(req, res) {
    try {
      const { personalId, usuarioId } = req.query;
      const clientId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Validar que al menos uno de los IDs esté presente
      if (!personalId && !usuarioId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere personalId o usuarioId para la conexión SSE'
        });
      }

      // Registrar cliente en el servicio de notificaciones
      notificationService.addClient(
        clientId, 
        res, 
        personalId ? parseInt(personalId) : null,
        usuarioId ? parseInt(usuarioId) : null
      );

      // El response se mantiene abierto para SSE
    } catch (error) {
      console.error('Error en conexión SSE:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al establecer conexión SSE',
        error: error.message
      });
    }
  },

  // Obtener estadísticas del servicio SSE
  async getSSEStats(req, res) {
    try {
      const stats = notificationService.getStats();
      
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas SSE',
        error: error.message
      });
    }
  },

  async testNotification(req, res) {
  try {
    const { personalId, usuarioId, tipo, mensaje, nivel } = req.body;
    
    if (!personalId && !usuarioId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere personalId o usuarioId'
      });
    }

    const notificationData = {
      tipo: tipo || 'prueba',
      mensaje: mensaje || 'Notificación de prueba',
      detalles: {
        esPrueba: true,
        timestamp: new Date().toISOString()
      },
      nivel: nivel || 'informativa',
      personalId: personalId ? parseInt(personalId) : null,
      usuarioId: usuarioId ? parseInt(usuarioId) : null
    };

    const notificacion = await notificationService.createAndBroadcast(notificationData);

    return res.json({
      success: true,
      message: 'Notificación de prueba enviada',
      data: notificacion
    });
  } catch (error) {
    console.error('Error enviando notificación de prueba:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al enviar notificación de prueba',
      error: error.message
    });
  }
}
};

module.exports = NotificacionController;