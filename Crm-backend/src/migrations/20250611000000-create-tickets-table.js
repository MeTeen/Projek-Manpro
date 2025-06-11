'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tickets', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      purchaseId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'customer_products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('Open', 'In Progress', 'Resolved', 'Closed'),
        allowNull: false,
        defaultValue: 'Open',
      },
      priority: {
        type: Sequelize.ENUM('Low', 'Medium', 'High', 'Urgent'),
        allowNull: false,
        defaultValue: 'Medium',
      },
      category: {
        type: Sequelize.ENUM('Delivery', 'Product Quality', 'Payment', 'General', 'Refund', 'Exchange'),
        allowNull: false,
      },
      assignedTo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'admins',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      resolution: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      attachmentUrls: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      resolvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('tickets', ['customerId']);
    await queryInterface.addIndex('tickets', ['status']);
    await queryInterface.addIndex('tickets', ['priority']);
    await queryInterface.addIndex('tickets', ['category']);
    await queryInterface.addIndex('tickets', ['assignedTo']);
    await queryInterface.addIndex('tickets', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tickets');
  },
};
