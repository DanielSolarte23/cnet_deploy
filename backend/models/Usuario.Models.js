const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define("Usuario", {
    nombre: DataTypes.STRING,
    cedula: DataTypes.STRING,
    telefono: DataTypes.STRING,
    rol: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [
          ["administrador", "almacenista", "talento humano", "coordinador"],
        ],
      },
    },
  });
  return Usuario;
};
