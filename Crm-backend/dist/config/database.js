"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = { development: {
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
    }, test: {
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
    }, production: {
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
exports.default = config;
//# sourceMappingURL=database.js.map