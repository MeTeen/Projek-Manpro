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
            // Add indexes for frequently queried columns to improve performance
            // Index on customers table
            yield queryInterface.addIndex('customers', ['createdAt'], {
                name: 'idx_customers_created_at'
            });
            yield queryInterface.addIndex('customers', ['firstName', 'lastName'], {
                name: 'idx_customers_names'
            });
            yield queryInterface.addIndex('customers', ['email'], {
                name: 'idx_customers_email'
            });
            // Index on customer_products table (transactions)
            yield queryInterface.addIndex('customer_products', ['createdAt'], {
                name: 'idx_customer_products_created_at'
            });
            yield queryInterface.addIndex('customer_products', ['customerId'], {
                name: 'idx_customer_products_customer_id'
            });
            yield queryInterface.addIndex('customer_products', ['productId'], {
                name: 'idx_customer_products_product_id'
            });
            yield queryInterface.addIndex('customer_products', ['purchaseDate'], {
                name: 'idx_customer_products_purchase_date'
            });
            // Index on tasks table
            yield queryInterface.addIndex('tasks', ['createdAt'], {
                name: 'idx_tasks_created_at'
            });
            yield queryInterface.addIndex('tasks', ['date'], {
                name: 'idx_tasks_date'
            });
            yield queryInterface.addIndex('tasks', ['isCompleted'], {
                name: 'idx_tasks_is_completed'
            });
            // Index on promos table
            yield queryInterface.addIndex('promos', ['createdAt'], {
                name: 'idx_promos_created_at'
            });
            yield queryInterface.addIndex('promos', ['isActive'], {
                name: 'idx_promos_is_active'
            });
            yield queryInterface.addIndex('promos', ['startDate', 'endDate'], {
                name: 'idx_promos_date_range'
            });
            // Composite indexes for common query patterns
            yield queryInterface.addIndex('customer_products', ['customerId', 'createdAt'], {
                name: 'idx_customer_products_customer_created'
            });
            yield queryInterface.addIndex('customer_products', ['productId', 'createdAt'], {
                name: 'idx_customer_products_product_created'
            });
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