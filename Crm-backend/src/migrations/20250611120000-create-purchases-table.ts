import { QueryInterface, DataTypes } from 'sequelize';

export = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('purchases', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      customer_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      product_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      unit_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      discount_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      final_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      promo_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'promos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      purchase_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('purchases', ['customer_id']);
    await queryInterface.addIndex('purchases', ['product_id']);
    await queryInterface.addIndex('purchases', ['promo_id']);
    await queryInterface.addIndex('purchases', ['purchase_date']);
    await queryInterface.addIndex('purchases', ['created_at']);
    
    // Composite indexes for common queries
    await queryInterface.addIndex('purchases', ['customer_id', 'purchase_date']);
    await queryInterface.addIndex('purchases', ['product_id', 'purchase_date']);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('purchases');
  }
};
