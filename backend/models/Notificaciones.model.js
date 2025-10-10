module.exports = (sequelize, DataTypes) => {
  const Notificacion = sequelize.define("Notificacion", {
    tipo: {
      type: DataTypes.ENUM(
        "stock_bajo",
        "devolucion_pendiente",
        "producto_nuevo",
        "otro",
        "confirmacion",
        "rechazo"
      ),
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    detalles: DataTypes.JSON,
    leida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fechaGeneracion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fechaLectura: DataTypes.DATE,
    nivel: {
      type: DataTypes.ENUM("informativa", "advertencia", "urgente"),
      defaultValue: "informativa",
    },
  });

  Notificacion.associate = (models) => {
    // Relación con Producto
    Notificacion.belongsTo(models.Producto, {
      foreignKey: "productoId",
      as: "producto",
      allowNull: true,
    });

    // Relación con Usuario
    Notificacion.belongsTo(models.Usuario, {
      foreignKey: "usuarioId",
      as: "destinatario",
      allowNull: true,
    });

    // Relación con Personal
    Notificacion.belongsTo(models.Personal, {
      foreignKey: "personalId",
      as: "personal",
      allowNull: true,
    });
  };

  return Notificacion;
};
