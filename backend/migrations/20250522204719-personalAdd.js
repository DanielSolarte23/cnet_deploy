"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Personal", "fecha_nacimiento", {
      type: Sequelize.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: "La fecha de nacimiento debe ser una fecha válida",
        },
        notEmpty: {
          msg: "La fecha de nacimiento no puede estar vacía",
        },
      },
    });
    await queryInterface.addColumn("Personal", "password", {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La contraseña no puede estar vacía",
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Personal", "fecha_nacimiento");
    await queryInterface.removeColumn("Personal", "password");
  },
};
