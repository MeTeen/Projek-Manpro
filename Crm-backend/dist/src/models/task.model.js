"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
// Task model class
class Task extends sequelize_1.Model {
    // Static method to initialize the model with Sequelize instance
    static initialize(sequelize) {
        Task.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            date: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            content: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
            },
            isCompleted: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
        }, {
            sequelize,
            tableName: 'tasks',
            timestamps: true,
        });
    }
}
exports.default = Task;
//# sourceMappingURL=task.model.js.map