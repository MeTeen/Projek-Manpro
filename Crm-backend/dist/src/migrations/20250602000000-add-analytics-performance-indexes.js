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
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up(queryInterface) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Adding performance indexes for analytics...');
                // Check if indexes already exist and add only if they don't
                const indexes = yield queryInterface.sequelize.query(`
        SELECT indexname FROM pg_indexes WHERE tablename IN ('customers', 'customer_products', 'products', 'promos', 'tasks');
      `);
                const existingIndexes = indexes[0].map(row => row.indexname);
                // Add indexes for analytics performance
                if (!existingIndexes.includes('idx_customers_created_at')) {
                    yield queryInterface.addIndex('customers', ['createdAt'], {
                        name: 'idx_customers_created_at'
                    });
                    console.log('Added idx_customers_created_at');
                }
                if (!existingIndexes.includes('idx_customer_products_purchase_date')) {
                    yield queryInterface.addIndex('customer_products', ['purchaseDate'], {
                        name: 'idx_customer_products_purchase_date'
                    });
                    console.log('Added idx_customer_products_purchase_date');
                }
                if (!existingIndexes.includes('idx_customer_products_customer_id')) {
                    yield queryInterface.addIndex('customer_products', ['customerId'], {
                        name: 'idx_customer_products_customer_id'
                    });
                    console.log('Added idx_customer_products_customer_id');
                }
                if (!existingIndexes.includes('idx_customer_products_product_id')) {
                    yield queryInterface.addIndex('customer_products', ['productId'], {
                        name: 'idx_customer_products_product_id'
                    });
                    console.log('Added idx_customer_products_product_id');
                }
                // Composite index for date range analytics queries
                if (!existingIndexes.includes('idx_customer_products_date_customer')) {
                    yield queryInterface.addIndex('customer_products', ['purchaseDate', 'customerId'], {
                        name: 'idx_customer_products_date_customer'
                    });
                    console.log('Added idx_customer_products_date_customer');
                }
                // Index for product sales aggregation
                if (!existingIndexes.includes('idx_customer_products_product_price_qty')) {
                    yield queryInterface.addIndex('customer_products', ['productId', 'price', 'quantity'], {
                        name: 'idx_customer_products_product_price_qty'
                    });
                    console.log('Added idx_customer_products_product_price_qty');
                }
                console.log('Analytics performance indexes added successfully!');
            }
            catch (error) {
                console.error('Error adding analytics performance indexes:', error);
                throw error;
            }
        });
    },
    down(queryInterface) {
        return __awaiter(this, void 0, void 0, function* () {
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
                        yield queryInterface.removeIndex('customers', indexName);
                    }
                    catch (e) {
                        try {
                            yield queryInterface.removeIndex('customer_products', indexName);
                        }
                        catch (e2) {
                            console.log(`Index ${indexName} might not exist, skipping...`);
                        }
                    }
                }
                console.log('Analytics performance indexes removed successfully!');
            }
            catch (error) {
                console.error('Error removing analytics performance indexes:', error);
                throw error;
            }
        });
    }
};
//# sourceMappingURL=20250602000000-add-analytics-performance-indexes.js.map