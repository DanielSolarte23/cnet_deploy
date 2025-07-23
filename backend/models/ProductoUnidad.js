module.exports = (sequelize, DataTypes) => {
    const ProductoUnidad = sequelize.define("ProductoUnidad", {
      serial: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      estado: {
        type: DataTypes.ENUM('nuevo', 'usado', 'baja', 'instalacion','instalado','reintegrado'),
        defaultValue: 'nuevo'
      },
      fechaIngreso: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });
  
    ProductoUnidad.associate = (models) => {
      ProductoUnidad.belongsTo(models.Producto, { foreignKey: 'productoId' });
    };
  
    return ProductoUnidad;
  };
  