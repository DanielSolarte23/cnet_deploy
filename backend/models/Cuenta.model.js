const bcryptjs = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const Cuenta = sequelize.define(
    "Cuenta",
    {
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tipo: {
        type: DataTypes.ENUM("usuario", "personal"),
        allowNull: false,
      },
      referenciaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      fotoPerfil: {
        type: DataTypes.STRING, 
        allowNull: true, 
      },
    },
    {
      hooks: {
        beforeCreate: async (cuenta) => {
          if (cuenta.password) {
            cuenta.password = await bcryptjs.hash(cuenta.password, 10);
          }
        },
      },
    }
  );

  Cuenta.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  return Cuenta;
};
