module.exports = (sequelize, DataTypes) => {
  const Personal = sequelize.define("Personal", {
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    cedula: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    expedicion: DataTypes.STRING,
    correo: DataTypes.STRING,
    fecha_nacimiento: DataTypes.DATE,
    cargo: DataTypes.STRING,
    departamento: DataTypes.STRING,
    telefono: DataTypes.STRING,
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    firma_path: DataTypes.STRING,
  });

  Personal.associate = (models) => {
    // Un Personal puede tener muchas Notificaciones
    Personal.hasMany(models.Notificacion, {
      foreignKey: "personalId",
      as: "notificaciones",
    });
  };

  return Personal;
};
