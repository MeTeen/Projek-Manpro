"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class Customer extends sequelize_1.Model {
    // Class method for model initialization
    static initialize(sequelize) {
        return Customer.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            firstName: {
                type: sequelize_1.DataTypes.STRING(64),
                allowNull: false,
                field: 'first_name'
            },
            lastName: {
                type: sequelize_1.DataTypes.STRING(64),
                allowNull: false,
                field: 'last_name'
            },
            email: {
                type: sequelize_1.DataTypes.STRING(128),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            phone: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: false,
            },
            address: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
            },
            city: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
            },
            state: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
            },
            zipCode: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: false,
                field: 'zip_code'
            },
            avatarUrl: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
                field: 'avatar_url'
            },
            totalSpent: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'total_spent'
            },
            purchaseCount: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'purchase_count'
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
            tableName: 'customers',
            sequelize,
            underscored: true, // This will automatically convert camelCase to snake_case
        });
    }
}
exports.default = Customer;
//# sourceMappingURL=customer.model.js.map