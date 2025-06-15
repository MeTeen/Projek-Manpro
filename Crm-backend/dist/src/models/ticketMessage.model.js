"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class TicketMessage extends sequelize_1.Model {
    static associate(models) {
        // Relationship dengan Ticket
        TicketMessage.belongsTo(models.Ticket, {
            foreignKey: 'ticketId',
            as: 'ticket'
        });
        // Polymorphic relationship dengan Customer dan Admin
        TicketMessage.belongsTo(models.Customer, {
            foreignKey: 'senderId',
            constraints: false,
            as: 'customerSender',
            scope: {
                senderType: 'customer'
            }
        });
        TicketMessage.belongsTo(models.Admin, {
            foreignKey: 'senderId',
            constraints: false,
            as: 'adminSender',
            scope: {
                senderType: 'admin'
            }
        });
    }
    static initModel(sequelize) {
        TicketMessage.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            }, ticketId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'ticket_id',
                references: {
                    model: 'tickets',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            senderId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'sender_id',
            },
            senderType: {
                type: sequelize_1.DataTypes.ENUM('customer', 'admin'),
                allowNull: false,
                field: 'sender_type',
            },
            message: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
            }, attachmentUrls: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true,
                field: 'attachment_urls',
                defaultValue: null,
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'created_at',
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'updated_at',
                defaultValue: sequelize_1.DataTypes.NOW,
            },
        }, {
            sequelize,
            tableName: 'ticket_messages', timestamps: true,
            indexes: [
                {
                    fields: ['ticket_id']
                },
                {
                    fields: ['sender_id', 'sender_type']
                },
                {
                    fields: ['created_at']
                }
            ]
        });
        return TicketMessage;
    }
}
exports.default = TicketMessage;
//# sourceMappingURL=ticketMessage.model.js.map