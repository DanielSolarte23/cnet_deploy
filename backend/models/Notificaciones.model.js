module.exports = (sequelize, DataTypes) => {
    const Notificacion = sequelize.define("Notificacion", {
      tipo: {
        type: DataTypes.ENUM('stock_bajo', 'devolucion_pendiente', 'producto_nuevo', 'otro'),
        allowNull: false
      },
      mensaje: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      detalles: DataTypes.JSON,
      leida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      fechaGeneracion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      fechaLectura: DataTypes.DATE,
      nivel: {
        type: DataTypes.ENUM('informativa', 'advertencia', 'urgente'),
        defaultValue: 'informativa'
      }
    });
  
    Notificacion.associate = (models) => {
      // Una notificación puede estar asociada a un producto
      Notificacion.belongsTo(models.Producto, {
        foreignKey: 'productoId',
        as: 'producto',
        allowNull: true
      });
      
      // Una notificación puede estar destinada a un usuario específico
      Notificacion.belongsTo(models.Usuario, {
        foreignKey: 'usuarioId',
        as: 'destinatario',
        allowNull: true
      });
    };
  
    return Notificacion;
  };