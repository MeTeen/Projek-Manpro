import { Dialect } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

interface DbConfig {
  host: string;
  username: string;
  password: string;
  database: string;
  port: number;
  dialect: Dialect;
  dialectOptions?: {
    ssl?: boolean | object;
  };
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
  logging: boolean | ((sql: string, timing?: number) => void);
}

interface Config {
  development: DbConfig;
  test: DbConfig;
  production: DbConfig;
}
const config: Config = {  development: {
    host: process.env.DB_HOST || 'aws-0-us-east-2.pooler.supabase.com',
    username: process.env.DB_USERNAME || 'postgres.slmrcglupqfskshfcsut',
    password: process.env.DB_PASSWORD || 'ZxHI6aX3RmIKo0Sq',
    database: process.env.DB_NAME || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    logging: console.log,
  },  test: {
    host: process.env.DB_HOST || 'aws-0-us-east-2.pooler.supabase.com',
    username: process.env.DB_USERNAME || 'postgres.slmrcglupqfskshfcsut',
    password: process.env.DB_PASSWORD || 'ZxHI6aX3RmIKo0Sq',
    database: process.env.DB_NAME || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
  },  production: {
    host: process.env.DB_HOST || 'aws-0-us-east-2.pooler.supabase.com',
    username: process.env.DB_USERNAME || 'postgres.slmrcglupqfskshfcsut',
    password: process.env.DB_PASSWORD || 'ZxHI6aX3RmIKo0Sq',
    database: process.env.DB_NAME || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    logging: false,
  },
};

export default config; 