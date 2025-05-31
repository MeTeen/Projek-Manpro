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
const sequelize_1 = require("sequelize");
module.exports = {
    up(queryInterface) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryInterface.createTable('promos', { id: {
                    type: sequelize_1.DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                    allowNull: false,
                },
                name: {
                    type: sequelize_1.DataTypes.STRING(128),
                    allowNull: false,
                    unique: true,
                },
                description: {
                    type: sequelize_1.DataTypes.TEXT,
                    allowNull: true,
                },
                type: {
                    type: sequelize_1.DataTypes.ENUM('percentage', 'fixed_amount'),
                    allowNull: false,
                },
                value: {
                    type: sequelize_1.DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                },
                start_date: {
                    type: sequelize_1.DataTypes.DATE,
                    allowNull: true,
                },
                end_date: {
                    type: sequelize_1.DataTypes.DATE,
                    allowNull: true,
                },
                is_active: {
                    type: sequelize_1.DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                }, created_by: {
                    type: sequelize_1.DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'admins',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL',
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
                },
            });
            const table = yield queryInterface.describeTable('promos');
            if (table.created_by) {
                yield queryInterface.addIndex('promos', ['created_by']);
            }
        });
    },
    down(queryInterface) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryInterface.dropTable('promos');
        });
    },
};
//# sourceMappingURL=20250527123048-create-promos-table.js.map