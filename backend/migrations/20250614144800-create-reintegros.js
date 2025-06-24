'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Reintegros', {
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
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'verificado', 'completado'),
        defaultValue: 'pendiente',
        allowNull: false,
      },
      almacenistaId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      entregaId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Entregas',
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
    await queryInterface.dropTable('Reintegros');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Reintegros_estado";');
  },
};
