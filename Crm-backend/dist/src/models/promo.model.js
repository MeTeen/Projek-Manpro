"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/promo.model.ts
const sequelize_1 = require("sequelize");
class Promo extends sequelize_1.Model {
    static initialize(sequelize) {
        return Promo.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
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
                type: sequelize_1.DataTypes.DECIMAL(10, 2), // Atau INTEGER jika tidak butuh desimal untuk fixed_amount
                allowNull: false,
            },
            startDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                field: 'start_date'
            },
            endDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                field: 'end_date'
            },
            isActive: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_active'
            },
            createdBy: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                allowNull: false, // atau false jika wajib
                references: {
                    model: 'admins', // nama tabel admin
                    key: 'id',
                },
                field: 'created_by'
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
            tableName: 'promos',
            sequelize,
            underscored: true,
        });
    }
}
exports.default = Promo;
//# sourceMappingURL=promo.model.js.map