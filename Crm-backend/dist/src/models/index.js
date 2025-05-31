"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerPromo = exports.Promo = exports.CustomerProduct = exports.Product = exports.Task = exports.Customer = exports.Admin = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("../../config/database"));
dotenv_1.default.config();
const env = process.env.NODE_ENV || 'development';
const dbConfig = database_1.default[env];
// Create Sequelize instance with connection URI for better Supabase compatibility
const connectionString = process.env.DATABASE_URL ||
    `postgresql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
const sequelize = new sequelize_1.Sequelize(connectionString, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
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
const promo_model_1 = __importDefault(require("./promo.model"));
exports.Promo = promo_model_1.default;
const customerPromo_model_1 = __importDefault(require("./customerPromo.model"));
exports.CustomerPromo = customerPromo_model_1.default;
// Initialize models
admin_model_1.default.initialize(sequelize);
customer_model_1.default.initialize(sequelize);
task_model_1.default.initialize(sequelize);
product_model_1.default.initialize(sequelize);
customerProduct_model_1.default.initialize(sequelize);
promo_model_1.default.initialize(sequelize);
customerPromo_model_1.default.initialize(sequelize);
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
// Add direct associations for CustomerProduct to fix include queries
customerProduct_model_1.default.belongsTo(customer_model_1.default, {
    foreignKey: 'customerId',
    as: 'customer'
});
customerProduct_model_1.default.belongsTo(product_model_1.default, {
    foreignKey: 'productId',
    as: 'product'
});
// Asosiasi untuk Promo dan Customer (Many-to-Many)
customer_model_1.default.belongsToMany(promo_model_1.default, {
    through: customerPromo_model_1.default,
    foreignKey: 'customerId', // Pastikan ini cocok dengan field di CustomerPromo
    otherKey: 'promoId', // Pastikan ini cocok dengan field di CustomerPromo
    as: 'availablePromos' // Customer bisa melihat promo yang tersedia untuknya
});
promo_model_1.default.belongsToMany(customer_model_1.default, {
    through: customerPromo_model_1.default,
    foreignKey: 'promoId',
    otherKey: 'customerId',
    as: 'eligibleCustomers' // Promo bisa melihat pelanggan mana saja yang berhak
});
// Inverse associations
customer_model_1.default.hasMany(customerProduct_model_1.default, {
    foreignKey: 'customerId',
    as: 'purchases'
});
product_model_1.default.hasMany(customerProduct_model_1.default, {
    foreignKey: 'productId',
    as: 'purchases'
});
customerPromo_model_1.default.belongsTo(customer_model_1.default, { foreignKey: 'customerId', as: 'customerDetails' });
customerPromo_model_1.default.belongsTo(promo_model_1.default, { foreignKey: 'promoId', as: 'promoDetails' });
customerPromo_model_1.default.belongsTo(admin_model_1.default, { foreignKey: 'assignedBy', as: 'assignerAdmin' });
admin_model_1.default.hasMany(customerPromo_model_1.default, { foreignKey: 'assignedBy', as: 'promoAssignmentsMade' });
// Asosiasi untuk Promo yang digunakan dalam Pembelian (CustomerProduct)
customerProduct_model_1.default.belongsTo(promo_model_1.default, {
    foreignKey: 'promoId', // Kolom di tabel CustomerProduct yang menjadi foreign key
    as: 'appliedPromoDetails', // Ini adalah ALIAS yang akan Anda gunakan di controller
    constraints: false
});
promo_model_1.default.hasMany(customerProduct_model_1.default, {
    foreignKey: 'promoId',
    as: 'purchaseTransactions' // Untuk melihat transaksi mana saja yang menggunakan promo ini
});
promo_model_1.default.belongsTo(admin_model_1.default, { foreignKey: 'createdBy', as: 'creatorAdmin' });
admin_model_1.default.hasMany(promo_model_1.default, { foreignKey: 'createdBy', as: 'createdPromos' });
//# sourceMappingURL=index.js.map