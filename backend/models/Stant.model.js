module.exports = (sequelize, DataTypes) => {
    const Stant = sequelize.define('Stant', {
      nombre: DataTypes.STRING
    });
  
    Stant.associate = (models) => {
      Stant.hasMany(models.Producto);
    };
  
    return Stant;
  };