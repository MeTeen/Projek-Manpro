const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

async function checkAvatars() {
  try {
    // First, check table structure
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'customers';
    `);
    
    console.log('Customer table columns:');
    columns.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type}`);
    });
      // Then check avatars
    const [results] = await sequelize.query(`
      SELECT id, first_name, last_name, avatar_url 
      FROM customers 
      WHERE avatar_url IS NOT NULL 
      ORDER BY id;
    `);
    
    console.log('\nCustomers with avatars:');
    results.forEach(customer => {
      console.log(`ID: ${customer.id}, Name: ${customer.first_name} ${customer.last_name}, Avatar: ${customer.avatar_url}`);
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAvatars();
