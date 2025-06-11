import { QueryInterface, DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface) {
    try {
      console.log('Adding performance indexes for analytics...');
      
      // Check if indexes already exist and add only if they don't
      const indexes = await queryInterface.sequelize.query(`
        SELECT indexname FROM pg_indexes WHERE tablename IN ('customers', 'customer_products', 'products', 'promos', 'tasks');
      `);
      
      const existingIndexes = (indexes[0] as any[]).map(row => row.indexname);
        // Add indexes for analytics performance
      if (!existingIndexes.includes('idx_customers_created_at')) {
        await queryInterface.addIndex('customers', ['created_at'], {
          name: 'idx_customers_created_at'
        });
        console.log('Added idx_customers_created_at');
      }
      
      if (!existingIndexes.includes('idx_customer_products_purchase_date')) {
        await queryInterface.addIndex('customer_products', ['purchase_date'], {
          name: 'idx_customer_products_purchase_date'
        });
        console.log('Added idx_customer_products_purchase_date');
      }
      
      if (!existingIndexes.includes('idx_customer_products_customer_id')) {
        await queryInterface.addIndex('customer_products', ['customer_id'], {
          name: 'idx_customer_products_customer_id'
        });
        console.log('Added idx_customer_products_customer_id');
      }
      
      if (!existingIndexes.includes('idx_customer_products_product_id')) {
        await queryInterface.addIndex('customer_products', ['product_id'], {
          name: 'idx_customer_products_product_id'
        });
        console.log('Added idx_customer_products_product_id');
      }
      
      // Composite index for date range analytics queries
      if (!existingIndexes.includes('idx_customer_products_date_customer')) {
        await queryInterface.addIndex('customer_products', ['purchase_date', 'customer_id'], {
          name: 'idx_customer_products_date_customer'
        });
        console.log('Added idx_customer_products_date_customer');
      }
      
      // Index for product sales aggregation
      if (!existingIndexes.includes('idx_customer_products_product_price_qty')) {
        await queryInterface.addIndex('customer_products', ['product_id', 'price', 'quantity'], {
          name: 'idx_customer_products_product_price_qty'
        });
        console.log('Added idx_customer_products_product_price_qty');
      }
      
      console.log('Analytics performance indexes added successfully!');
    } catch (error) {
      console.error('Error adding analytics performance indexes:', error);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    try {
      console.log('Removing analytics performance indexes...');
      
      const indexesToRemove = [
        'idx_customers_created_at',
        'idx_customer_products_purchase_date',
        'idx_customer_products_customer_id',
        'idx_customer_products_product_id',
        'idx_customer_products_date_customer',
        'idx_customer_products_product_price_qty'
      ];
      
      for (const indexName of indexesToRemove) {
        try {
          await queryInterface.removeIndex('customers', indexName);
        } catch (e) {
          try {
            await queryInterface.removeIndex('customer_products', indexName);
          } catch (e2) {
            console.log(`Index ${indexName} might not exist, skipping...`);
          }
        }
      }
      
      console.log('Analytics performance indexes removed successfully!');
    } catch (error) {
      console.error('Error removing analytics performance indexes:', error);
      throw error;
    }
  }
};
