"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class Purchase extends sequelize_1.Model {
    // Class method for model initialization
    static initialize(sequelize) {
        return Purchase.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            customerId: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'customers',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT', // Prevent deletion of customer with purchases
                field: 'customer_id'
            },
            productId: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT', // Prevent deletion of product with purchases
                field: 'product_id'
            },
            quantity: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                validate: {
                    min: 1
                }
            },
            unitPrice: {
                type: sequelize_1.DataTypes.DECIMAL(12, 2),
                allowNull: false,
                validate: {
                    min: 0
                },
                field: 'unit_price'
            },
            totalAmount: {
                type: sequelize_1.DataTypes.DECIMAL(12, 2),
                allowNull: false,
                validate: {
                    min: 0
                },
                field: 'total_amount'
            },
            discountAmount: {
                type: sequelize_1.DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
                validate: {
                    min: 0
                },
                field: 'discount_amount'
            },
            finalAmount: {
                type: sequelize_1.DataTypes.DECIMAL(12, 2),
                allowNull: false,
                validate: {
                    min: 0
                },
                field: 'final_amount'
            },
            promoId: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
                references: {
                    model: 'promos',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                field: 'promo_id'
            },
            purchaseDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
                field: 'purchase_date'
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
                field: 'created_at'
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
                field: 'updated_at'
            }
        }, {
            sequelize,
            tableName: 'purchases',
            timestamps: true,
            indexes: [
                {
                    fields: ['customer_id']
                },
                {
                    fields: ['product_id']
                },
                {
                    fields: ['promo_id']
                },
                {
                    fields: ['purchase_date']
                },
                {
                    fields: ['created_at']
                },
                // Composite indexes for common queries
                {
                    fields: ['customer_id', 'purchase_date']
                },
                {
                    fields: ['product_id', 'purchase_date']
                }
            ],
            // Add hooks for auto-calculation
            hooks: {
                beforeCreate: (purchase) => {
                    purchase.totalAmount = purchase.unitPrice * purchase.quantity;
                    purchase.finalAmount = purchase.totalAmount - (purchase.discountAmount || 0);
                },
                beforeUpdate: (purchase) => {
                    if (purchase.changed('unitPrice') || purchase.changed('quantity') || purchase.changed('discountAmount')) {
                        purchase.totalAmount = purchase.unitPrice * purchase.quantity;
                        purchase.finalAmount = purchase.totalAmount - (purchase.discountAmount || 0);
                    }
                }
            }
        });
    }
}
exports.default = Purchase;
//# sourceMappingURL=purchase.model.js.map