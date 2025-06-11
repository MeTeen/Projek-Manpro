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
        yield queryInterface.createTable('tickets', {
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
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            purchaseId: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
                references: {
                    model: 'customer_products',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            subject: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
            },
            message: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
            },
            status: {
                type: sequelize_1.DataTypes.ENUM('Open', 'In Progress', 'Resolved', 'Closed'),
                allowNull: false,
                defaultValue: 'Open',
            },
            priority: {
                type: sequelize_1.DataTypes.ENUM('Low', 'Medium', 'High', 'Urgent'),
                allowNull: false,
                defaultValue: 'Medium',
            },
            category: {
                type: sequelize_1.DataTypes.ENUM('Delivery', 'Product Quality', 'Payment', 'General', 'Refund', 'Exchange'),
                allowNull: false,
            },
            assignedTo: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
                references: {
                    model: 'admins',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            resolution: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            attachmentUrls: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true,
            },
            resolvedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
        });
        // Add indexes for better performance
        yield queryInterface.addIndex('tickets', ['customerId']);
        yield queryInterface.addIndex('tickets', ['status']);
        yield queryInterface.addIndex('tickets', ['priority']);
        yield queryInterface.addIndex('tickets', ['category']);
        yield queryInterface.addIndex('tickets', ['assignedTo']);
        yield queryInterface.addIndex('tickets', ['createdAt']);
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.dropTable('tickets');
    }),
};
//# sourceMappingURL=20250611000000-create-tickets-table.js.map