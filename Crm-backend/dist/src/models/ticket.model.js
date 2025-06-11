"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class Ticket extends sequelize_1.Model {
    static initialize(sequelize) {
        return Ticket.init({
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
        }, {
            sequelize,
            tableName: 'tickets',
            timestamps: true,
            indexes: [
                {
                    fields: ['customerId']
                },
                {
                    fields: ['status']
                },
                {
                    fields: ['priority']
                },
                {
                    fields: ['category']
                },
                {
                    fields: ['assignedTo']
                },
                {
                    fields: ['createdAt']
                }
            ]
        });
    }
}
exports.default = Ticket;
//# sourceMappingURL=ticket.model.js.map