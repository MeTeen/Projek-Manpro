import { QueryInterface, DataTypes } from 'sequelize';

export = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('tickets', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      customerId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      purchaseId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'customer_products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      subject: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Open', 'In Progress', 'Resolved', 'Closed'),
        allowNull: false,
        defaultValue: 'Open',
      },
      priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High', 'Urgent'),
        allowNull: false,
        defaultValue: 'Medium',
      },
      category: {
        type: DataTypes.ENUM('Delivery', 'Product Quality', 'Payment', 'General', 'Refund', 'Exchange'),
        allowNull: false,
      },
      assignedTo: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'admins',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      resolution: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      attachmentUrls: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('tickets');
  },
};
