// services/NotificationService.js
const db = require('../models');
const EventEmitter = require('events');

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.connectedClients = new Map(); // Map<clientId, {response, personalId, usuarioId}>
  }

  // Registrar cliente SSE
  addClient(clientId, response, personalId = null, usuarioId = null) {
    this.connectedClients.set(clientId, {
      response,
      personalId,
      usuarioId,
      connected: true
    });

    // Configurar headers SSE
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Enviar mensaje inicial
    this.sendToClient(clientId, {
      type: 'connected',
      message: 'Conectado al servicio de notificaciones',
      timestamp: new Date().toISOString()
    });

    // Manejar desconexión
    response.on('close', () => {
      this.removeClient(clientId);
    });

    console.log(`Cliente SSE conectado: ${clientId}, PersonalId: ${personalId}, UsuarioId: ${usuarioId}`);
  }

  // Remover cliente SSE
  removeClient(clientId) {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.connected = false;
      this.connectedClients.delete(clientId);
      console.log(`Cliente SSE desconectado: ${clientId}`);
    }
  }

  // Enviar mensaje a cliente específico
  sendToClient(clientId, data) {
    const client = this.connectedClients.get(clientId);
    if (client && client.connected) {
      try {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        client.response.write(message);
      } catch (error) {
        console.error(`Error enviando mensaje a cliente ${clientId}:`, error);
        this.removeClient(clientId);
      }
    }
  }

  // Broadcast a todos los clientes conectados
  broadcast(data) {
    this.connectedClients.forEach((client, clientId) => {
      this.sendToClient(clientId, data);
    });
  }

  // Enviar a clientes específicos por personalId
  sendToPersonal(personalId, data) {
    this.connectedClients.forEach((client, clientId) => {
      if (client.personalId === personalId) {
        this.sendToClient(clientId, data);
      }
    });
  }

  // Enviar a clientes específicos por usuarioId
  sendToUsuario(usuarioId, data) {
    this.connectedClients.forEach((client, clientId) => {
      if (client.usuarioId === usuarioId) {
        this.sendToClient(clientId, data);
      }
    });
  }

  // Crear notificación y broadcast
  async createAndBroadcast(notificationData) {
    try {
      // Crear notificación en la base de datos
      const notificacion = await db.Notificacion.create(notificationData);

      // Obtener la notificación completa con relaciones
      const notificacionCompleta = await db.Notificacion.findByPk(notificacion.id, {
        include: [
          { 
            model: db.Usuario, 
            as: 'destinatario', 
            attributes: ['id', 'nombre', 'rol'] 
          },
          { 
            model: db.Producto, 
            as: 'producto', 
            attributes: ['id', 'descripcion', 'codigo', 'stock', 'stockMinimo'] 
          },
          { 
            model: db.Personal, 
            as: 'personal', 
            attributes: ['id', 'nombre', 'apellido', 'cargo'] 
          }
        ]
      });

      const sseData = {
        type: 'notification',
        notification: notificacionCompleta,
        timestamp: new Date().toISOString()
      };

      // Enviar según el tipo de destinatario
      if (notificationData.personalId) {
        this.sendToPersonal(notificationData.personalId, sseData);
      } else if (notificationData.usuarioId) {
        this.sendToUsuario(notificationData.usuarioId, sseData);
      } else {
        // Notificación general - broadcast a todos
        this.broadcast(sseData);
      }

      console.log(`Notificación creada y enviada via SSE:`, {
        id: notificacion.id,
        tipo: notificationData.tipo,
        personalId: notificationData.personalId,
        usuarioId: notificationData.usuarioId
      });

      return notificacionCompleta;
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw error;
    }
  }

  // Crear notificación de confirmación de entrega
  async createEntregaNotification(entrega, productos) {
    // El campo correcto es personalId según el modelo Entrega
    const personalId = entrega.personalId || (entrega.tecnicoData ? entrega.tecnicoData.id : null);

    console.log('DEBUG - Datos de entrega para notificación:', {
      entregaId: entrega.id,
      personalId: entrega.personalId,
      tecnicoData: entrega.tecnicoData,
      personalIdFinal: personalId
    });

    const notificationData = {
      tipo: "confirmacion",
      mensaje: `Nueva entrega asignada - ID: ${entrega.id}`,
      detalles: {
        entregaId: entrega.id,
        numeroProductos: productos.length,
        fechaEntrega: entrega.fecha,
        proyecto: entrega.proyecto,
        productos: productos.map(p => ({
          descripcion: p.descripcion || (p.Producto ? p.Producto.descripcion : 'Producto sin descripción'),
          cantidad: p.cantidad
        }))
      },
      nivel: "informativa",
      personalId: personalId
    };

    if (!personalId) {
      console.warn('ADVERTENCIA: No se pudo determinar el personalId para la notificación de entrega. Entrega:', entrega.id);
      return null;
    }

    return await this.createAndBroadcast(notificationData);
  }

  // Crear notificación de stock bajo
  async createStockBajoNotification(producto) {
    const notificationData = {
      tipo: "stock_bajo",
      mensaje: `Stock bajo para el producto: ${producto.descripcion} (${producto.stock} unidades)`,
      detalles: {
        stockActual: producto.stock,
        stockMinimo: producto.stockMinimo,
        codigo: producto.codigo || "",
      },
      nivel: producto.stock === 0 ? "urgente" : "advertencia",
      productoId: producto.id,
      // Esta notificación va para los almacenistas/administradores
      usuarioId: null // Se puede configurar para enviar a roles específicos
    };

    return await this.createAndBroadcast(notificationData);
  }

  // Obtener estadísticas de clientes conectados
  getStats() {
    const stats = {
      totalClientes: this.connectedClients.size,
      clientesPorPersonal: {},
      clientesPorUsuario: {}
    };

    this.connectedClients.forEach((client) => {
      if (client.personalId) {
        stats.clientesPorPersonal[client.personalId] = 
          (stats.clientesPorPersonal[client.personalId] || 0) + 1;
      }
      if (client.usuarioId) {
        stats.clientesPorUsuario[client.usuarioId] = 
          (stats.clientesPorUsuario[client.usuarioId] || 0) + 1;
      }
    });

    return stats;
  }
}

// Singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;