"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/customerPromo.model.ts
const sequelize_1 = require("sequelize");
class CustomerPromo extends sequelize_1.Model {
    static initialize(sequelize) {
        return CustomerPromo.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            customerId: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'customers', key: 'id' },
                field: 'customer_id'
            },
            promoId: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'promos', key: 'id' },
                field: 'promo_id'
            },
            assignedBy: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                allowNull: true, // atau false jika wajib
                references: { model: 'admins', key: 'id' },
                field: 'assigned_by'
            },
            isUsed: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false,
                field: 'is_used'
            },
            usedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                field: 'used_at'
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
            tableName: 'customer_promos',
            sequelize,
            underscored: true,
            indexes: [
                {
                    unique: false, // Satu customer hanya bisa punya satu jenis promo yang sama (jika diperlukan)
                    // Jika satu customer bisa punya promo yang sama berkali-kali (misal voucher), set unique: false
                    fields: ['customer_id', 'promo_id']
                }
            ]
        });
    }
}
exports.default = CustomerPromo;
//# sourceMappingURL=customerPromo.model.js.map