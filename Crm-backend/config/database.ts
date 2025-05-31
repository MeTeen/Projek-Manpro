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
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'crm_db',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    dialectOptions: {
      ssl: false,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    logging: console.log,
  },
  test: {
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'crm_test_db',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    dialectOptions: {
      ssl: false,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
  },  production: {
    host: process.env.DB_HOST || 'mysql',
    username: process.env.DB_USERNAME || 'crm_user',
    password: process.env.DB_PASSWORD || 'crm_password',
    database: process.env.DB_NAME || 'crm_db',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    dialectOptions: {
      ssl: false,
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