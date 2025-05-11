"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../src/models");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sequelize_1 = require("sequelize");
// Configuration
const migrationsDir = path_1.default.join(__dirname, '../src/migrations');
// Ensure migrations table exists
function ensureMigrationsTable() {
    return __awaiter(this, void 0, void 0, function* () {
        const queryInterface = models_1.sequelize.getQueryInterface();
        yield queryInterface.createTable('SequelizeMeta', {
            name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            },
        }).catch((e) => {
            // Table may already exist
            console.log('SequelizeMeta table already exists or error:', e.message);
        });
    });
}
// Get executed migrations
function getExecutedMigrations() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const queryInterface = models_1.sequelize.getQueryInterface();
            const [results] = yield models_1.sequelize.query('SELECT name FROM SequelizeMeta');
            return results.map((row) => row.name);
        }
        catch (error) {
            console.error('Error getting executed migrations:', error);
            return [];
        }
    });
}
// Main migration function
function migrate() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Ensure migrations table exists
            yield ensureMigrationsTable();
            // Get executed migrations
            const executedMigrations = yield getExecutedMigrations();
            console.log('Already executed migrations:', executedMigrations);
            // Read migration files
            const migrationFiles = fs_1.default.readdirSync(migrationsDir)
                .filter(file => file.endsWith('.ts'))
                .sort();
            console.log('Found migration files:', migrationFiles);
            // Determine pending migrations
            const pendingMigrations = migrationFiles.filter(file => !executedMigrations.includes(file));
            console.log('Pending migrations:', pendingMigrations);
            if (pendingMigrations.length === 0) {
                console.log('No pending migrations');
                return;
            }
            // Execute pending migrations
            for (const migrationFile of pendingMigrations) {
                console.log(`Executing migration: ${migrationFile}`);
                const migrationPath = path_1.default.join(migrationsDir, migrationFile);
                const migration = require(migrationPath);
                try {
                    yield migration.up(models_1.sequelize.getQueryInterface(), sequelize_1.Sequelize);
                    // Mark migration as executed
                    yield models_1.sequelize.query('INSERT INTO SequelizeMeta (name) VALUES (?)', {
                        replacements: [migrationFile],
                        type: 'INSERT'
                    });
                    console.log(`Migration ${migrationFile} executed successfully`);
                }
                catch (error) {
                    console.error(`Error executing migration ${migrationFile}:`, error);
                    throw error; // Stop migration process
                }
            }
            console.log('All migrations executed successfully');
        }
        catch (error) {
            console.error('Migration failed:', error);
        }
        finally {
            yield models_1.sequelize.close();
        }
    });
}
// Run migrations
migrate();
//# sourceMappingURL=migrate.js.map