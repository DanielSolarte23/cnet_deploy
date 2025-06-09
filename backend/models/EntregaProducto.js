module.exports = (sequelize, DataTypes) => {
  const EntregaProducto = sequelize.define("EntregaProducto", {
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    descripcion: DataTypes.STRING,
    serial: DataTypes.STRING,
    marca: DataTypes.STRING,
    color: DataTypes.STRING,
    devuelto: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        isValidDevuelto(value) {
          if (value < 0) {
            throw new Error("El valor devuelto no puede ser negativo");
          }
        },
      },
    },
    estado: {
      type: DataTypes.ENUM(
        "pendiente",
        "devuelto_parcial",
        "devuelto_completo"
      ),
      defaultValue: "pendiente",
    },
    // En el modelo EntregaProducto
    unidadesSeriadas: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  });

  EntregaProducto.associate = (models) => {
    EntregaProducto.belongsTo(models.Entrega);
    EntregaProducto.belongsTo(models.Producto);
  };

  return EntregaProducto;
};
