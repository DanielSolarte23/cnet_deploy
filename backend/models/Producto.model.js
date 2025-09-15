module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define("Producto", {
    codigo: {
      type: DataTypes.STRING,
      unique: true,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    marca: DataTypes.STRING,
    modelo: DataTypes.STRING,
    color: DataTypes.STRING,
    unidadMedida: {
      type: DataTypes.STRING,
      defaultValue: "unidad",
    },
    stock: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    stockMinimo: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    fechaIngreso: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.ENUM(
        "disponible",
        "agotado",
        "baja",
        "instalacion",
        "instalado",  
        "reintegrado"
      ),
      defaultValue: "disponible",
    },
    isStockLow: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isReintegrable: {
      type: DataTypes.BOOLEAN,
      default:false
    },
    notas: DataTypes.TEXT,
  });

  Producto.associate = (models) => {
    Producto.belongsTo(models.Stant);
    Producto.belongsTo(models.Subcategoria);
    Producto.hasMany(models.EntregaProducto);
    Producto.hasMany(models.ReintegroProducto);
    Producto.hasMany(models.ProductoUnidad, { foreignKey: "productoId" }); // Nueva relación
  };

  return Producto;
};
