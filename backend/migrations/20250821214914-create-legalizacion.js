'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Legalizacions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      tipo: {
        type: Sequelize.ENUM(
          'instalado',
          'consumido',
          'perdido',
          'dañado',
          'donado',
          'otro'
        ),
        allowNull: false
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      justificacion: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ubicacion: {
        type: Sequelize.STRING,
        allowNull: true
      },
      evidencia: {
        type: Sequelize.JSON,
        allowNull: true
      },
      unidadesSeriadas: {
        type: Sequelize.JSON,
        allowNull: true
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'aprobada', 'rechazada'),
        allowNull: false,
        defaultValue: 'pendiente'
      },
      fechaAprobacion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      motivoRechazo: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Foreign Keys
      productoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Productos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      entregaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Entregas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      personalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Personals',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      almacenistaId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Agregar índices para mejorar el rendimiento
    await queryInterface.addIndex('Legalizacions', ['entregaId']);
    await queryInterface.addIndex('Legalizacions', ['productoId']);
    await queryInterface.addIndex('Legalizacions', ['personalId']);
    await queryInterface.addIndex('Legalizacions', ['estado']);
    await queryInterface.addIndex('Legalizacions', ['tipo']);
    await queryInterface.addIndex('Legalizacions', ['fecha']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Legalizacions');
  }
};