module.exports = (sequelize, DataTypes) => {
    const Subcategoria = sequelize.define('Subcategoria', {
      nombre: DataTypes.STRING
    });
  
    Subcategoria.associate = (models) => {
      Subcategoria.belongsTo(models.Categoria);
      Subcategoria.hasMany(models.Producto);
    };
  
    return Subcategoria;
  };