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
exports.down = exports.up = void 0;
const sequelize_1 = require("sequelize");
const up = (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if table exists
    const tableExists = (tableName) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield queryInterface.sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = '${tableName}' AND table_schema = 'public';
    `, { type: sequelize_1.QueryTypes.SELECT });
        return result.length > 0;
    });
    // Check if indexes exist before adding them
    const indexExists = (indexName) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield queryInterface.sequelize.query(`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'ticket_messages' AND indexname = '${indexName}';
    `, { type: sequelize_1.QueryTypes.SELECT });
        return result.length > 0;
    });
    if (!(yield tableExists('ticket_messages'))) {
        yield queryInterface.createTable('ticket_messages', {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            ticketId: {
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
            },
            attachmentUrls: {
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
        });
        // Add indexes only if table was just created
        yield queryInterface.addIndex('ticket_messages', ['ticket_id']);
        yield queryInterface.addIndex('ticket_messages', ['sender_id', 'sender_type']);
        yield queryInterface.addIndex('ticket_messages', ['created_at']);
    }
    else {
        // If table exists, only add missing indexes
        if (!(yield indexExists('ticket_messages_ticket_id'))) {
            yield queryInterface.addIndex('ticket_messages', ['ticket_id']);
        }
        if (!(yield indexExists('ticket_messages_sender_id_sender_type'))) {
            yield queryInterface.addIndex('ticket_messages', ['sender_id', 'sender_type']);
        }
        if (!(yield indexExists('ticket_messages_created_at'))) {
            yield queryInterface.addIndex('ticket_messages', ['created_at']);
        }
    }
});
exports.up = up;
const down = (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
    yield queryInterface.dropTable('ticket_messages');
});
exports.down = down;
//# sourceMappingURL=20250612000000-create-ticket-messages.js.map