import { QueryInterface, DataTypes } from 'sequelize';

export = {
  up: async (queryInterface: QueryInterface) => {
    // Transfer data from customer_products to purchases
    await queryInterface.sequelize.query(`
      INSERT INTO purchases (
        customer_id,
        product_id,
        quantity,
        unit_price,
        total_amount,
        discount_amount,
        final_amount,
        promo_id,
        purchase_date,
        created_at,
        updated_at
      )
      SELECT 
        customer_id,
        product_id,
        quantity,
        price as unit_price,
        (price * quantity) as total_amount,
        COALESCE(discount_amount, 0) as discount_amount,
        ((price * quantity) - COALESCE(discount_amount, 0)) as final_amount,
        promo_id,
        purchase_date,
        created_at,
        updated_at
      FROM customer_products
      ORDER BY created_at ASC
    `);
    
    console.log('Data migration from customer_products to purchases completed');
  },

  down: async (queryInterface: QueryInterface) => {
    // Clear purchases table (this is destructive!)
    await queryInterface.bulkDelete('purchases', {}, {});
    console.log('Purchases table cleared - data migration rolled back');
  }
};
