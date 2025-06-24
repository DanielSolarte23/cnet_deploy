'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Entregas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      proyecto: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      estado: {
        type: Sequelize.ENUM(
          'pendiente',
          'entregada',
          'parcialmente_devuelta',
          'completamente_devuelta'
        ),
        defaultValue: 'pendiente',
      },
      fechaEstimadaDevolucion: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      almacenista: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      personalId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Personals',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Primero eliminar el tipo ENUM para evitar errores
    await queryInterface.dropTable('Entregas');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Entregas_estado";');
  },
};
