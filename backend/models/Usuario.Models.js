const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define(
    "Usuario",
    {
      nombre: DataTypes.STRING,
      cedula: DataTypes.STRING,
      telefono: DataTypes.STRING,
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
        validate: {
          notEmpty: {
            msg: "El nombre de usuario no puede estar vacío",
          },
        },
      },
      correo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "el correo no puede estar vacio",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "La contraseña no puede estar vacía",
          },
        },
      },
      rol: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [["administrador", "almacenista", "talento humano"]],
        },
      },
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  Usuario.prototype.validatePassword = async function (password) {
    if (!this.password) {
      return false;
    }
    return await bcrypt.compare(password, this.password);
  };
  return Usuario;
};
