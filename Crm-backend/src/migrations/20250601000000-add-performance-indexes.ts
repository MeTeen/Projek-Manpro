import { QueryInterface, DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface) {    // Add indexes for frequently queried columns to improve performance
    // Index on customers table
    try {
      await queryInterface.addIndex('customers', ['created_at'], {
        name: 'idx_customers_created_at'
      });
    } catch (e) {
      console.log('Index idx_customers_created_at already exists');
    }
    
    try {
      await queryInterface.addIndex('customers', ['first_name', 'last_name'], {
        name: 'idx_customers_names'
      });
    } catch (e) {
      console.log('Index idx_customers_names already exists');
    }
    
    try {
      await queryInterface.addIndex('customers', ['email'], {
        name: 'idx_customers_email'
      });
    } catch (e) {
      console.log('Index idx_customers_email already exists');
    }

    // Index on customer_products table (transactions) - some already exist, add conditionally
    try {
      await queryInterface.addIndex('customer_products', ['created_at'], {
        name: 'idx_customer_products_created_at'
      });
    } catch (e) {
      // Index might already exist
      console.log('Index idx_customer_products_created_at already exists');
    }
    
    try {
      await queryInterface.addIndex('customer_products', ['customer_id'], {
        name: 'idx_customer_products_customer_id'
      });
    } catch (e) {
      console.log('Index idx_customer_products_customer_id already exists');
    }
    
    try {
      await queryInterface.addIndex('customer_products', ['product_id'], {
        name: 'idx_customer_products_product_id'
      });
    } catch (e) {
      console.log('Index idx_customer_products_product_id already exists');
    }
    
    try {
      await queryInterface.addIndex('customer_products', ['purchase_date'], {
        name: 'idx_customer_products_purchase_date'
      });
    } catch (e) {
      console.log('Index idx_customer_products_purchase_date already exists');
    }    // Index on tasks table
    await queryInterface.addIndex('tasks', ['created_at'], {
      name: 'idx_tasks_created_at'
    });
    
    await queryInterface.addIndex('tasks', ['date'], {
      name: 'idx_tasks_date'
    });
    
    await queryInterface.addIndex('tasks', ['is_completed'], {
      name: 'idx_tasks_is_completed'
    });

    // Index on promos table
    await queryInterface.addIndex('promos', ['created_at'], {
      name: 'idx_promos_created_at'
    });
    
    await queryInterface.addIndex('promos', ['is_active'], {
      name: 'idx_promos_is_active'
    });
    
    await queryInterface.addIndex('promos', ['start_date', 'end_date'], {
      name: 'idx_promos_date_range'
    });

    // Composite indexes for common query patterns - add conditionally since some might exist
    try {
      await queryInterface.addIndex('customer_products', ['customer_id', 'created_at'], {
        name: 'idx_customer_products_customer_created'
      });
    } catch (e) {
      console.log('Index idx_customer_products_customer_created already exists');
    }
    
    try {
      await queryInterface.addIndex('customer_products', ['product_id', 'created_at'], {
        name: 'idx_customer_products_product_created'
      });
    } catch (e) {
      console.log('Index idx_customer_products_product_created already exists');
    }
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
