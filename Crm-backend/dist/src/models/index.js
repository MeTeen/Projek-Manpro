"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerProduct = exports.Product = exports.Task = exports.Customer = exports.Admin = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("../../config/database"));
dotenv_1.default.config();
const env = process.env.NODE_ENV || 'development';
const dbConfig = database_1.default[env];
// Create Sequelize instance
const sequelize = new sequelize_1.Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: dbConfig.logging,
});
exports.sequelize = sequelize;
// Import models
const admin_model_1 = __importDefault(require("./admin.model"));
exports.Admin = admin_model_1.default;
const customer_model_1 = __importDefault(require("./customer.model"));
exports.Customer = customer_model_1.default;
const task_model_1 = __importDefault(require("./task.model"));
exports.Task = task_model_1.default;
const product_model_1 = __importDefault(require("./product.model"));
exports.Product = product_model_1.default;
const customerProduct_model_1 = __importDefault(require("./customerProduct.model"));
exports.CustomerProduct = customerProduct_model_1.default;
// Initialize models
admin_model_1.default.initialize(sequelize);
customer_model_1.default.initialize(sequelize);
task_model_1.default.initialize(sequelize);
product_model_1.default.initialize(sequelize);
customerProduct_model_1.default.initialize(sequelize);
// Define model associations
customer_model_1.default.belongsToMany(product_model_1.default, {
    through: customerProduct_model_1.default,
    foreignKey: 'customerId',
    otherKey: 'productId'
});
product_model_1.default.belongsToMany(customer_model_1.default, {
    through: customerProduct_model_1.default,
    foreignKey: 'productId',
    otherKey: 'customerId'
});
//# sourceMappingURL=index.js.map