module.exports = (sequelize, DataTypes) => {
  const Reintegro = sequelize.define("Reintegro", {
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    observaciones: DataTypes.TEXT,
    estado: {
      type: DataTypes.ENUM('pendiente', 'verificado', 'completado'),
      defaultValue: 'pendiente'
    }
  });

  Reintegro.associate = (models) => {
    Reintegro.hasMany(models.ReintegroProducto);
    
    // Relación con el almacenista que recibe
    Reintegro.belongsTo(models.Usuario, {
      foreignKey: "almacenistaId",
      as: "almacenistaData"
    });
    
    // Relación con la entrega original
    Reintegro.belongsTo(models.Entrega, {
      foreignKey: "entregaId",
      as: "entregaOriginal"
    });
    
    // Relación con el personal que devuelve
    Reintegro.belongsTo(models.Personal, {
      foreignKey: "personalId",
      as: "tecnicoData",
      allowNull: true
    });
  };

  return Reintegro;
};