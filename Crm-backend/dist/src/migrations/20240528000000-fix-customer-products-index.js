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
module.exports = {
    up: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // First, try to drop the existing index
            yield queryInterface.removeIndex('customer_products', 'customer_products_customer_id_product_id');
        }
        catch (error) {
            console.log('No existing index with default name to remove. Trying other variations...');
            try {
                // Try alternative default name format
                yield queryInterface.removeIndex('customer_products', 'customer_id_product_id');
            }
            catch (error) {
                console.log('Could not find index with alternative name. This is ok if index does not exist.');
            }
        }
        // Now create a new explicitly non-unique index
        yield queryInterface.addIndex('customer_products', ['customer_id', 'product_id'], {
            name: 'customer_product_idx',
            unique: false
        });
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        // In the down migration, we'll remove our new index and add back a regular index
        yield queryInterface.removeIndex('customer_products', 'customer_product_idx');
        // Add back the original index (without explicit unique setting)
        yield queryInterface.addIndex('customer_products', ['customer_id', 'product_id']);
    })
};
//# sourceMappingURL=20240528000000-fix-customer-products-index.js.map