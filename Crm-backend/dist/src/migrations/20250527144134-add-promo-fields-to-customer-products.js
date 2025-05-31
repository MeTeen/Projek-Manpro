// Crm-backend\src\migrations\YYYYMMDDHHMMSS-add-promo-fields-to-customer-products.ts
'use strict';
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
const sequelize_1 = require("sequelize"); // Impor tipe jika diperlukan untuk IntelliSense
module.exports = {
    up(queryInterface, Sequelize) {
        return __awaiter(this, void 0, void 0, function* () {
            // Tambahkan kolom promo_id
            yield queryInterface.addColumn('customer_products', 'promo_id', {
                type: sequelize_1.DataTypes.INTEGER, // Gunakan DataTypes dari argumen Sequelize
                allowNull: true,
                references: {
                    model: 'promos',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            });
            // Tambahkan kolom discount_amount
            yield queryInterface.addColumn('customer_products', 'discount_amount', {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.00
            });
        });
    },
    down(queryInterface, Sequelize) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryInterface.removeColumn('customer_products', 'discount_amount');
            yield queryInterface.removeColumn('customer_products', 'promo_id');
        });
    }
};
//# sourceMappingURL=20250527144134-add-promo-fields-to-customer-products.js.map