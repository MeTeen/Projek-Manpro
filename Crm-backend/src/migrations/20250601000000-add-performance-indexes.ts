import { QueryInterface, DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface) {
    // Add indexes for frequently queried columns to improve performance
    
    // Index on customers table
    await queryInterface.addIndex('customers', ['createdAt'], {
      name: 'idx_customers_created_at'
    });
    
    await queryInterface.addIndex('customers', ['firstName', 'lastName'], {
      name: 'idx_customers_names'
    });
    
    await queryInterface.addIndex('customers', ['email'], {
      name: 'idx_customers_email'
    });

    // Index on customer_products table (transactions)
    await queryInterface.addIndex('customer_products', ['createdAt'], {
      name: 'idx_customer_products_created_at'
    });
    
    await queryInterface.addIndex('customer_products', ['customerId'], {
      name: 'idx_customer_products_customer_id'
    });
    
    await queryInterface.addIndex('customer_products', ['productId'], {
      name: 'idx_customer_products_product_id'
    });
    
    await queryInterface.addIndex('customer_products', ['purchaseDate'], {
      name: 'idx_customer_products_purchase_date'
    });

    // Index on tasks table
    await queryInterface.addIndex('tasks', ['createdAt'], {
      name: 'idx_tasks_created_at'
    });
    
    await queryInterface.addIndex('tasks', ['date'], {
      name: 'idx_tasks_date'
    });
    
    await queryInterface.addIndex('tasks', ['isCompleted'], {
      name: 'idx_tasks_is_completed'
    });

    // Index on promos table
    await queryInterface.addIndex('promos', ['createdAt'], {
      name: 'idx_promos_created_at'
    });
    
    await queryInterface.addIndex('promos', ['isActive'], {
      name: 'idx_promos_is_active'
    });
    
    await queryInterface.addIndex('promos', ['startDate', 'endDate'], {
      name: 'idx_promos_date_range'
    });

    // Composite indexes for common query patterns
    await queryInterface.addIndex('customer_products', ['customerId', 'createdAt'], {
      name: 'idx_customer_products_customer_created'
    });
    
    await queryInterface.addIndex('customer_products', ['productId', 'createdAt'], {
      name: 'idx_customer_products_product_created'
    });
  },

  async down(queryInterface: QueryInterface) {
    // Remove all indexes
    await queryInterface.removeIndex('customers', 'idx_customers_created_at');
    await queryInterface.removeIndex('customers', 'idx_customers_names');
    await queryInterface.removeIndex('customers', 'idx_customers_email');
    
    await queryInterface.removeIndex('customer_products', 'idx_customer_products_created_at');
    await queryInterface.removeIndex('customer_products', 'idx_customer_products_customer_id');
    await queryInterface.removeIndex('customer_products', 'idx_customer_products_product_id');
    await queryInterface.removeIndex('customer_products', 'idx_customer_products_purchase_date');
    
    await queryInterface.removeIndex('tasks', 'idx_tasks_created_at');
    await queryInterface.removeIndex('tasks', 'idx_tasks_date');
    await queryInterface.removeIndex('tasks', 'idx_tasks_is_completed');
    
    await queryInterface.removeIndex('promos', 'idx_promos_created_at');
    await queryInterface.removeIndex('promos', 'idx_promos_is_active');
    await queryInterface.removeIndex('promos', 'idx_promos_date_range');
    
    await queryInterface.removeIndex('customer_products', 'idx_customer_products_customer_created');
    await queryInterface.removeIndex('customer_products', 'idx_customer_products_product_created');
  }
};
