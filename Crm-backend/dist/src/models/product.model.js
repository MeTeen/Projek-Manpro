"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class Product extends sequelize_1.Model {
    // Class method for model initialization
    static initialize(sequelize) {
        return Product.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: sequelize_1.DataTypes.STRING(128),
                allowNull: false,
            },
            stock: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            price: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            dimensions: {
                type: sequelize_1.DataTypes.STRING(128),
                allowNull: true,
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
            },
        }, {
            tableName: 'products',
            sequelize,
            underscored: true, // Use snake_case for all database column names
        });
    }
}
exports.default = Product;
//# sourceMappingURL=product.model.js.map