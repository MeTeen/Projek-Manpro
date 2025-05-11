import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    try {
      // First, try to drop the existing index
      await queryInterface.removeIndex('customer_products', 'customer_products_customer_id_product_id');
    } catch (error) {
      console.log('No existing index with default name to remove. Trying other variations...');
      try {
        // Try alternative default name format
        await queryInterface.removeIndex('customer_products', 'customer_id_product_id');
      } catch (error) {
        console.log('Could not find index with alternative name. This is ok if index does not exist.');
      }
    }

    // Now create a new explicitly non-unique index
    await queryInterface.addIndex('customer_products', ['customer_id', 'product_id'], {
      name: 'customer_product_idx',
      unique: false
    });
  },

  down: async (queryInterface: QueryInterface) => {
    // In the down migration, we'll remove our new index and add back a regular index
    await queryInterface.removeIndex('customer_products', 'customer_product_idx');
    
    // Add back the original index (without explicit unique setting)
    await queryInterface.addIndex('customer_products', ['customer_id', 'product_id']);
  }
}; 