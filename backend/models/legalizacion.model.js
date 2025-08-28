module.exports = (sequelize, DataTypes) => {
  const Legalizacion = sequelize.define("Legalizacion", {
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM(
        "instalado", 
        "consumido", 
        "perdido", 
        "dañado", 
        "donado",
        "otro"
      ),
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    justificacion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    observaciones: {
      type: DataTypes.TEXT,
    },
    ubicacion: {
      type: DataTypes.STRING, // Donde se instaló, consumió, etc.
    },
    unidadesSeriadas: {
      type: DataTypes.JSON, // Array de IDs de ProductoUnidad para productos con serial
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada'),
      defaultValue: 'pendiente',
    },
    fechaAprobacion: {
      type: DataTypes.DATE,
    },
    motivoRechazo: {
      type: DataTypes.TEXT,
    }
  });

  Legalizacion.associate = (models) => {
    // Relación con el producto
    Legalizacion.belongsTo(models.Producto, {
      foreignKey: "productoId",
      as: "producto"
    });
    
    // Relación con la entrega original
    Legalizacion.belongsTo(models.Entrega, {
      foreignKey: "entregaId",
      as: "entregaOriginal"
    });
    
    // Relación con el técnico que legaliza
    Legalizacion.belongsTo(models.Personal, {
      foreignKey: "personalId",
      as: "tecnicoData"
    });
    
    // Relación con el almacenista que aprueba/rechaza
    Legalizacion.belongsTo(models.Usuario, {
      foreignKey: "almacenistaId",
      as: "almacenistaData",
      allowNull: true
    });
  };

  return Legalizacion;
};