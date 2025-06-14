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
            // Index on customers table
            try {
                yield queryInterface.addIndex('customers', ['created_at'], {
                    name: 'idx_customers_created_at'
                });
            }
            catch (e) {
                console.log('Index idx_customers_created_at already exists');
            }
            try {
                yield queryInterface.addIndex('customers', ['first_name', 'last_name'], {
                    name: 'idx_customers_names'
                });
            }
            catch (e) {
                console.log('Index idx_customers_names already exists');
            }
            try {
                yield queryInterface.addIndex('customers', ['email'], {
                    name: 'idx_customers_email'
                });
            }
            catch (e) {
                console.log('Index idx_customers_email already exists');
            }
            // Index on customer_products table (transactions) - some already exist, add conditionally
            try {
                yield queryInterface.addIndex('customer_products', ['created_at'], {
                    name: 'idx_customer_products_created_at'
                });
            }
            catch (e) {
                // Index might already exist
                console.log('Index idx_customer_products_created_at already exists');
            }
            try {
                yield queryInterface.addIndex('customer_products', ['customer_id'], {
                    name: 'idx_customer_products_customer_id'
                });
            }
            catch (e) {
                console.log('Index idx_customer_products_customer_id already exists');
            }
            try {
                yield queryInterface.addIndex('customer_products', ['product_id'], {
                    name: 'idx_customer_products_product_id'
                });
            }
            catch (e) {
                console.log('Index idx_customer_products_product_id already exists');
            }
            try {
                yield queryInterface.addIndex('customer_products', ['purchase_date'], {
                    name: 'idx_customer_products_purchase_date'
                });
            }
            catch (e) {
                console.log('Index idx_customer_products_purchase_date already exists');
            } // Index on tasks table
            yield queryInterface.addIndex('tasks', ['created_at'], {
                name: 'idx_tasks_created_at'
            });
            yield queryInterface.addIndex('tasks', ['date'], {
                name: 'idx_tasks_date'
            });
            yield queryInterface.addIndex('tasks', ['is_completed'], {
                name: 'idx_tasks_is_completed'
            });
            // Index on promos table
            yield queryInterface.addIndex('promos', ['created_at'], {
                name: 'idx_promos_created_at'
            });
            yield queryInterface.addIndex('promos', ['is_active'], {
                name: 'idx_promos_is_active'
            });
            yield queryInterface.addIndex('promos', ['start_date', 'end_date'], {
                name: 'idx_promos_date_range'
            });
            // Composite indexes for common query patterns - add conditionally since some might exist
            try {
                yield queryInterface.addIndex('customer_products', ['customer_id', 'created_at'], {
                    name: 'idx_customer_products_customer_created'
                });
            }
            catch (e) {
                console.log('Index idx_customer_products_customer_created already exists');
            }
            try {
                yield queryInterface.addIndex('customer_products', ['product_id', 'created_at'], {
                    name: 'idx_customer_products_product_created'
                });
            }
            catch (e) {
                console.log('Index idx_customer_products_product_created already exists');
            }
        });
    },
    down(queryInterface) {
        return __awaiter(this, void 0, void 0, function* () {
            // Remove all indexes
            yield queryInterface.removeIndex('customers', 'idx_customers_created_at');
            yield queryInterface.removeIndex('customers', 'idx_customers_names');
            yield queryInterface.removeIndex('customers', 'idx_customers_email');
            yield queryInterface.removeIndex('customer_products', 'idx_customer_products_created_at');
            yield queryInterface.removeIndex('customer_products', 'idx_customer_products_customer_id');
            yield queryInterface.removeIndex('customer_products', 'idx_customer_products_product_id');
            yield queryInterface.removeIndex('customer_products', 'idx_customer_products_purchase_date');
            yield queryInterface.removeIndex('tasks', 'idx_tasks_created_at');
            yield queryInterface.removeIndex('tasks', 'idx_tasks_date');
            yield queryInterface.removeIndex('tasks', 'idx_tasks_is_completed');
            yield queryInterface.removeIndex('promos', 'idx_promos_created_at');
            yield queryInterface.removeIndex('promos', 'idx_promos_is_active');
            yield queryInterface.removeIndex('promos', 'idx_promos_date_range');
            yield queryInterface.removeIndex('customer_products', 'idx_customer_products_customer_created');
            yield queryInterface.removeIndex('customer_products', 'idx_customer_products_product_created');
        });
    }
};
//# sourceMappingURL=20250601000000-add-performance-indexes.js.map