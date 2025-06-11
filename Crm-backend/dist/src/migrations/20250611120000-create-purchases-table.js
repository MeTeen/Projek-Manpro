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
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.createTable('purchases', {
            id: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            customer_id: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'customers',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            product_id: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            quantity: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            unit_price: {
                type: sequelize_1.DataTypes.DECIMAL(12, 2),
                allowNull: false,
            },
            total_amount: {
                type: sequelize_1.DataTypes.DECIMAL(12, 2),
                allowNull: false,
            },
            discount_amount: {
                type: sequelize_1.DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
            },
            final_amount: {
                type: sequelize_1.DataTypes.DECIMAL(12, 2),
                allowNull: false,
            },
            promo_id: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
                references: {
                    model: 'promos',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            purchase_date: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            created_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            updated_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            }
        });
        // Add indexes for better performance
        yield queryInterface.addIndex('purchases', ['customer_id']);
        yield queryInterface.addIndex('purchases', ['product_id']);
        yield queryInterface.addIndex('purchases', ['promo_id']);
        yield queryInterface.addIndex('purchases', ['purchase_date']);
        yield queryInterface.addIndex('purchases', ['created_at']);
        // Composite indexes for common queries
        yield queryInterface.addIndex('purchases', ['customer_id', 'purchase_date']);
        yield queryInterface.addIndex('purchases', ['product_id', 'purchase_date']);
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.dropTable('purchases');
    })
};
//# sourceMappingURL=20250611120000-create-purchases-table.js.map