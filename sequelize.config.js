require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'postgres.slmrcglupqfskshfcsut',
    password: process.env.DB_PASSWORD || 'ZxHI6aX3RmIKo0Sq',
    database: process.env.DB_NAME || 'postgres',
    host: process.env.DB_HOST || 'aws-0-us-east-2.pooler.supabase.com',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
