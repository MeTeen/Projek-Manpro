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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class Admin extends sequelize_1.Model {
    // Method to check if password is valid
    validatePassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcryptjs_1.default.compare(password, this.password);
        });
    }
    // Class method for model initialization
    static initialize(sequelize) {
        return Admin.init({ id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            username: {
                type: sequelize_1.DataTypes.STRING(128),
                allowNull: false,
                unique: true,
            },
            email: {
                type: sequelize_1.DataTypes.STRING(128),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            password: {
                type: sequelize_1.DataTypes.STRING(128),
                allowNull: false,
            },
            role: {
                type: sequelize_1.DataTypes.ENUM('admin', 'super_admin'),
                allowNull: false,
                defaultValue: 'admin',
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
            tableName: 'admins',
            sequelize,
            hooks: {
                beforeCreate: (admin) => __awaiter(this, void 0, void 0, function* () {
                    // Hash password before saving
                    const salt = yield bcryptjs_1.default.genSalt(10);
                    admin.password = yield bcryptjs_1.default.hash(admin.password, salt);
                }),
                beforeUpdate: (admin) => __awaiter(this, void 0, void 0, function* () {
                    if (admin.changed('password')) {
                        const salt = yield bcryptjs_1.default.genSalt(10);
                        admin.password = yield bcryptjs_1.default.hash(admin.password, salt);
                    }
                }),
            },
        });
    }
}
exports.default = Admin;
//# sourceMappingURL=admin.model.js.map