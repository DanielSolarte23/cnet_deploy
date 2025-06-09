module.exports = (sequelize, DataTypes) => {
    const ReintegroProducto = sequelize.define('ReintegroProducto', {
      cantidad: DataTypes.INTEGER,
      descripcion: DataTypes.STRING,
      serial: DataTypes.STRING,
      marca: DataTypes.STRING,
      color: DataTypes.STRING
    });
  
    ReintegroProducto.associate = (models) => {
      ReintegroProducto.belongsTo(models.Reintegro);
      ReintegroProducto.belongsTo(models.Producto);
    };
  
    return ReintegroProducto;
  };