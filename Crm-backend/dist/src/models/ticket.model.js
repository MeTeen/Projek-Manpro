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
            }, status: {
                type: sequelize_1.DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
                allowNull: false,
                defaultValue: 'open',
            },
            priority: {
                type: sequelize_1.DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
                allowNull: false,
                defaultValue: 'medium',
            },
            category: {
                type: sequelize_1.DataTypes.ENUM('delivery', 'product_quality', 'payment', 'general', 'refund', 'exchange'),
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
            }, resolvedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            firstResponseAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            lastActivityAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            escalatedAt: {
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