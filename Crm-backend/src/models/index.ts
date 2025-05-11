import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import config from '../../config/database';

dotenv.config();
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env as keyof typeof config];

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: dbConfig.logging,
  }
);

// Import models
import Admin from './admin.model';
import Customer from './customer.model';
import Task from './task.model';
import Product from './product.model';
import CustomerProduct from './customerProduct.model';

// Initialize models
Admin.initialize(sequelize);
Customer.initialize(sequelize);
Task.initialize(sequelize);
Product.initialize(sequelize);
CustomerProduct.initialize(sequelize);

// Define model associations
Customer.belongsToMany(Product, { 
  through: CustomerProduct,
  foreignKey: 'customerId',
  otherKey: 'productId'
});

Product.belongsToMany(Customer, { 
  through: CustomerProduct,
  foreignKey: 'productId',
  otherKey: 'customerId'
});

// Add direct associations for CustomerProduct to fix include queries
CustomerProduct.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer'
});

CustomerProduct.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

// Inverse associations
Customer.hasMany(CustomerProduct, {
  foreignKey: 'customerId',
  as: 'purchases'
});

Product.hasMany(CustomerProduct, {
  foreignKey: 'productId',
  as: 'purchases'
});

export {
  sequelize,
  Admin,
  Customer,
  Task,
  Product,
  CustomerProduct
}; 