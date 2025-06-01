const { Sequelize } = require('sequelize');
const config = require('./config/database-wrapper.js');

const sequelize = new Sequelize(config.development);

async function createIndexes() {
  try {
    console.log('Creating performance indexes...');
    
    // Create indexes using raw SQL queries with correct column names
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers (created_at)');
    console.log('✓ Created idx_customers_created_at');
    
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_customers_names ON customers (first_name, last_name)');
    console.log('✓ Created idx_customers_names');
    
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email)');
    console.log('✓ Created idx_customers_email');
    
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_customer_products_created_at ON customer_products (created_at)');
    console.log('✓ Created idx_customer_products_created_at');
    
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_customer_products_purchase_date ON customer_products (purchase_date)');
    console.log('✓ Created idx_customer_products_purchase_date');
    
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_customer_products_customer_id ON customer_products (customer_id)');
    console.log('✓ Created idx_customer_products_customer_id');
    
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_customer_products_product_id ON customer_products (product_id)');
    console.log('✓ Created idx_customer_products_product_id');
      // Check if tasks table exists first
    const [tasksTables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'tasks'");
    if (tasksTables.length > 0) {
      await sequelize.query('CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks ("createdAt")');
      console.log('✓ Created idx_tasks_created_at');
      
      await sequelize.query('CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks (date)');
      console.log('✓ Created idx_tasks_date');
      
      await sequelize.query('CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks ("isCompleted")');
      console.log('✓ Created idx_tasks_is_completed');
    }
    
    // Check if promos table exists first
    const [promosTables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'promos'");
    if (promosTables.length > 0) {
      await sequelize.query('CREATE INDEX IF NOT EXISTS idx_promos_created_at ON promos (created_at)');
      console.log('✓ Created idx_promos_created_at');
      
      await sequelize.query('CREATE INDEX IF NOT EXISTS idx_promos_is_active ON promos (is_active)');
      console.log('✓ Created idx_promos_is_active');
      
      await sequelize.query('CREATE INDEX IF NOT EXISTS idx_promos_date_range ON promos (start_date, end_date)');
      console.log('✓ Created idx_promos_date_range');
    }
    
    // Composite indexes for common query patterns
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_customer_products_customer_created ON customer_products (customer_id, created_at)');
    console.log('✓ Created idx_customer_products_customer_created');
    
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_customer_products_product_created ON customer_products (product_id, created_at)');
    console.log('✓ Created idx_customer_products_product_created');
    
    console.log('All indexes created successfully!');
  } catch (error) {
    console.error('Error creating indexes:', error.message);
  } finally {
    await sequelize.close();
  }
}

createIndexes();
