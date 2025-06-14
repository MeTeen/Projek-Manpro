import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import config from '../../config/database';

dotenv.config();
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env as keyof typeof config];

// Create Sequelize instance with connection URI for better Supabase compatibility
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;

const sequelize = new Sequelize(connectionString, {
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

// Import models
import Admin from './admin.model';
import Customer from './customer.model';
import Task from './task.model';
import Product from './product.model';
import CustomerProduct from './customerProduct.model';
import Purchase from './purchase.model';
import Promo from './promo.model';
import CustomerPromo from './customerPromo.model';
import Ticket from './ticket.model';
import TicketMessage from './ticketMessage.model';

// Initialize models
Admin.initialize(sequelize);
Customer.initialize(sequelize);
Task.initialize(sequelize);
Product.initialize(sequelize);
CustomerProduct.initialize(sequelize);
Purchase.initialize(sequelize);
Promo.initialize(sequelize);
CustomerPromo.initialize(sequelize);
Ticket.initialize(sequelize);
TicketMessage.initModel(sequelize);

// Define model associations
Customer.belongsToMany(Product, { 
  through: CustomerProduct,
  foreignKey: 'customerId',
  otherKey: 'productId',
  as: 'Products' // Use capital P to match Sequelize default
});

Product.belongsToMany(Customer, { 
  through: CustomerProduct,
  foreignKey: 'productId',
  otherKey: 'customerId',
  as: 'Customers' // Use capital C to match Sequelize default
});

// Purchase model associations
Purchase.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer'
});

Purchase.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

Purchase.belongsTo(Promo, {
  foreignKey: 'promoId',
  as: 'promo'
});

Customer.hasMany(Purchase, {
  foreignKey: 'customerId',
  as: 'purchases'
});

Product.hasMany(Purchase, {
  foreignKey: 'productId',
  as: 'purchases'
});

Promo.hasMany(Purchase, {
  foreignKey: 'promoId',
  as: 'purchases'
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

// Asosiasi untuk Promo dan Customer (Many-to-Many)
Customer.belongsToMany(Promo, {
  through: CustomerPromo,
  foreignKey: 'customerId', // Pastikan ini cocok dengan field di CustomerPromo
  otherKey: 'promoId',    // Pastikan ini cocok dengan field di CustomerPromo
  as: 'availablePromos' // Customer bisa melihat promo yang tersedia untuknya
});

Promo.belongsToMany(Customer, {
  through: CustomerPromo,
  foreignKey: 'promoId',
  otherKey: 'customerId',
  as: 'eligibleCustomers' // Promo bisa melihat pelanggan mana saja yang berhak
});

// Inverse associations (legacy CustomerProduct - keeping for backward compatibility)
Customer.hasMany(CustomerProduct, {
  foreignKey: 'customerId',
  as: 'customerProducts' // Changed from 'purchases' to avoid conflict
});

Product.hasMany(CustomerProduct, {
  foreignKey: 'productId',
  as: 'customerProducts' // Changed from 'purchases' to avoid conflict
});

CustomerPromo.belongsTo(Customer, { foreignKey: 'customerId', as: 'customerDetails' });
CustomerPromo.belongsTo(Promo, { foreignKey: 'promoId', as: 'promoDetails' });
CustomerPromo.belongsTo(Admin, { foreignKey: 'assignedBy', as: 'assignerAdmin' });
Admin.hasMany(CustomerPromo, { foreignKey: 'assignedBy', as: 'promoAssignmentsMade' });


// Asosiasi untuk Promo yang digunakan dalam Pembelian (CustomerProduct)
CustomerProduct.belongsTo(Promo, {
  foreignKey: 'promoId',          // Kolom di tabel CustomerProduct yang menjadi foreign key
  as: 'appliedPromoDetails',      // Ini adalah ALIAS yang akan Anda gunakan di controller
  constraints: false
});

Promo.hasMany(CustomerProduct, {
  foreignKey: 'promoId',
  as: 'purchaseTransactions' // Untuk melihat transaksi mana saja yang menggunakan promo ini
});

Promo.belongsTo(Admin, { foreignKey: 'createdBy', as: 'creatorAdmin' });
Admin.hasMany(Promo, { foreignKey: 'createdBy', as: 'createdPromos' });

// Ticket associations
Ticket.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(Ticket, { foreignKey: 'customerId', as: 'tickets' });

Ticket.belongsTo(Purchase, { foreignKey: 'purchaseId', as: 'purchase' });
Purchase.hasMany(Ticket, { foreignKey: 'purchaseId', as: 'tickets' });

Ticket.belongsTo(Admin, { foreignKey: 'assignedTo', as: 'assignedAdmin' });
Admin.hasMany(Ticket, { foreignKey: 'assignedTo', as: 'assignedTickets' });

// TicketMessage associations
Ticket.hasMany(TicketMessage, { foreignKey: 'ticketId', as: 'messages' });
TicketMessage.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

TicketMessage.belongsTo(Customer, {
  foreignKey: 'senderId',
  constraints: false,
  as: 'customerSender',
  scope: {
    senderType: 'customer'
  }
});

TicketMessage.belongsTo(Admin, {
  foreignKey: 'senderId',
  constraints: false,
  as: 'adminSender',
  scope: {
    senderType: 'admin'
  }
});

export {
  sequelize,
  Admin,
  Customer,
  Task,
  Product,
  CustomerProduct,
  Purchase,
  Promo, // Export model baru
  CustomerPromo, // Export model baru
  Ticket, // Export Ticket model
  TicketMessage // Export TicketMessage model
};