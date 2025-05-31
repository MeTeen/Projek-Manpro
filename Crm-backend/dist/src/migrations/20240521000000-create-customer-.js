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
    up: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        // First, check if the table exists
        const tables = yield queryInterface.showAllTables();
        if (!tables.includes('customers')) {
            // Create the table if it doesn't exist
            yield queryInterface.createTable('customers', { id: {
                    type: sequelize_1.DataTypes.INTEGER,
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
            });
            return;
        }
        // If we have an existing table with 'name', we need to restructure it
        const tableInfo = yield queryInterface.describeTable('customers');
        // Check if we need to split 'name' into 'first_name' and 'last_name'
        if (tableInfo.name && !tableInfo.first_name && !tableInfo.last_name) {
            // Add the new columns
            yield queryInterface.addColumn('customers', 'first_name', {
                type: sequelize_1.DataTypes.STRING(64),
                allowNull: true, // Initially allow null to perform data migration
            });
            yield queryInterface.addColumn('customers', 'last_name', {
                type: sequelize_1.DataTypes.STRING(64),
                allowNull: true, // Initially allow null to perform data migration
            });
            // Update the data from 'name' to 'first_name' and 'last_name'
            yield queryInterface.sequelize.query(`
        UPDATE customers 
        SET first_name = SUBSTRING_INDEX(name, ' ', 1),
            last_name = SUBSTRING_INDEX(name, ' ', -1)
      `);
            // Make the columns non-nullable after migration
            yield queryInterface.changeColumn('customers', 'first_name', {
                type: sequelize_1.DataTypes.STRING(64),
                allowNull: false,
            });
            yield queryInterface.changeColumn('customers', 'last_name', {
                type: sequelize_1.DataTypes.STRING(64),
                allowNull: false,
            });
            // Remove the old 'name' column
            yield queryInterface.removeColumn('customers', 'name');
        }
        // Add missing columns if they don't exist
        if (!tableInfo.city) {
            yield queryInterface.addColumn('customers', 'city', {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                defaultValue: '',
            });
        }
        if (!tableInfo.state) {
            yield queryInterface.addColumn('customers', 'state', {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                defaultValue: '',
            });
        }
        if (!tableInfo.zip_code) {
            yield queryInterface.addColumn('customers', 'zip_code', {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: false,
                defaultValue: '',
            });
        }
        if (!tableInfo.avatar_url) {
            yield queryInterface.addColumn('customers', 'avatar_url', {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
            });
        }
        // We'll use separate migration for total_spent and purchase_count
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        // This is a complex migration that's hard to reverse, so we'll just provide a warning
        console.warn('This migration cannot be fully reversed automatically.');
        // If needed, you could try to merge first_name and last_name back to name and remove the other fields
        const tableInfo = yield queryInterface.describeTable('customers');
        if (tableInfo.first_name && tableInfo.last_name && !tableInfo.name) {
            // Add the name column
            yield queryInterface.addColumn('customers', 'name', {
                type: sequelize_1.DataTypes.STRING(128),
                allowNull: true,
            });
            // Merge the first_name and last_name into name
            yield queryInterface.sequelize.query(`
        UPDATE customers 
        SET name = CONCAT(first_name, ' ', last_name)
      `);
            // Make name non-nullable
            yield queryInterface.changeColumn('customers', 'name', {
                type: sequelize_1.DataTypes.STRING(128),
                allowNull: false,
            });
            // Remove the split name columns
            yield queryInterface.removeColumn('customers', 'first_name');
            yield queryInterface.removeColumn('customers', 'last_name');
        }
        // Remove the added columns
        const columnsToRemove = ['city', 'state', 'zip_code', 'avatar_url'];
        for (const column of columnsToRemove) {
            if (tableInfo[column]) {
                yield queryInterface.removeColumn('customers', column);
            }
        }
    })
};
//# sourceMappingURL=20240521000000-create-customer-.js.map