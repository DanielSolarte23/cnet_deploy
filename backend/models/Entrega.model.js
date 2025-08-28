// models/Entrega.js - Actualización de estados
module.exports = (sequelize, DataTypes) => {
  const Entrega = sequelize.define("Entrega", {
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    proyecto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    observaciones: DataTypes.TEXT,
    estado: {
      type: DataTypes.ENUM(
        "pendiente",
        "entregada",
        "parcialmente_devuelta",
        "completamente_devuelta",
        "parcialmente_legalizada",  
        "completamente_legalizada",
        "mixto_parcial",
        "cerrada"                   
      ),
      defaultValue: "pendiente",
    },
    wasConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fechaEstimadaDevolucion: DataTypes.DATE,
    fechaCierre: {  // NUEVO CAMPO
      type: DataTypes.DATE,
      allowNull: true,
    }
  });

  Entrega.associate = (models) => {
    Entrega.hasMany(models.EntregaProducto);
    Entrega.hasMany(models.Legalizacion, {
      foreignKey: "entregaId",
      as: "legalizaciones"
    });

    // Relación con el almacenista (Usuario)
    Entrega.belongsTo(models.Usuario, {
      foreignKey: "almacenista",
      as: "almacenistaData",
    });

    // Relación con la persona que recibe (Personal)
    Entrega.belongsTo(models.Personal, {
      foreignKey: "personalId",
      as: "tecnicoData",
      allowNull: true,
    });
  };

  return Entrega;
};