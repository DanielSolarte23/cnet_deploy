module.exports = (sequelize, DataTypes) => {
  const Entrega = sequelize.define("Entrega", {
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    proyecto: {
      type: DataTypes.STRING,
      allowNull: false
    },
    observaciones: DataTypes.TEXT,
    estado: {
      type: DataTypes.ENUM('pendiente', '', 'parcialmente_devuelta', 'completamente_devuelta'),
      defaultValue: 'pendiente'
    },
    fechaEstimadaDevolucion: DataTypes.DATE
  });

  Entrega.associate = (models) => {
    Entrega.hasMany(models.EntregaProducto);
    
    // Relación con el almacenista (Usuario)
    Entrega.belongsTo(models.Usuario, {
      foreignKey: "almacenista",
      as: "almacenistaData",
    });
    
    // Relación con la persona que recibe (Personal)
    Entrega.belongsTo(models.Personal, {
      foreignKey: "personalId",
      as: "tecnicoData",
      allowNull: true // Puede ser nulo como solicitaste
    });
  };

  return Entrega;
};