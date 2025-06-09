module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define('Categoria', {
    nombre: DataTypes.STRING
  });

  Categoria.associate = (models) => {
    Categoria.hasMany(models.Subcategoria);
  };

  return Categoria;
};