'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Measurements', {
      measure_uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      measure_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      measure_datetime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      measure_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      confirmed: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable('Customers', {
      customer_code: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable('MeasurementCustomer', {
      measurement_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Measurements',
          key: 'measure_uuid',
        },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      customer_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Customers',
          key: 'customer_code',
        },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('MeasurementCustomer');
    await queryInterface.dropTable('Customers');
    await queryInterface.dropTable('Measurements');
  },
};
