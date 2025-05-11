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
        // First, check if the columns already exist
        const tableInfo = yield queryInterface.describeTable('customers');
        // Add totalSpent if it doesn't exist
        if (!tableInfo.total_spent) {
            yield queryInterface.addColumn('customers', 'total_spent', {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            });
        }
        // Add purchaseCount if it doesn't exist
        if (!tableInfo.purchase_count) {
            yield queryInterface.addColumn('customers', 'purchase_count', {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            });
        }
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        // Remove the fields when reverting the migration
        yield queryInterface.removeColumn('customers', 'total_spent');
        yield queryInterface.removeColumn('customers', 'purchase_count');
    })
};
//# sourceMappingURL=20240521000003-add-fields-to-customers.js.map