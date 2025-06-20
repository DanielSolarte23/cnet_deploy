module.exports = (sequelize, DataTypes) => {
  const ReintegroProducto = sequelize.define('ReintegroProducto', {
    cantidad: DataTypes.INTEGER,
    descripcion: DataTypes.STRING,
    serial: DataTypes.STRING,
    marca: DataTypes.STRING,
    color: DataTypes.STRING,
    // Agregar el campo que falta
    unidadesSeriadas: {
      type: DataTypes.JSON, // o DataTypes.TEXT si prefieres almacenar como string
      allowNull: true,
      comment: 'Array de IDs de unidades específicas para productos seriados'
    }
  });

  ReintegroProducto.associate = (models) => {
    ReintegroProducto.belongsTo(models.Reintegro);
    ReintegroProducto.belongsTo(models.Producto);
  };

  return ReintegroProducto;
};