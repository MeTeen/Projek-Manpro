"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
module.exports = {
    up: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        // Transfer data from customer_products to purchases
        yield queryInterface.sequelize.query(`
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
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        // Clear purchases table (this is destructive!)
        yield queryInterface.bulkDelete('purchases', {}, {});
        console.log('Purchases table cleared - data migration rolled back');
    })
};
//# sourceMappingURL=20250611120001-migrate-customer-products-to-purchases.js.map