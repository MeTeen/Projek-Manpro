import { sequelize } from '../src/models';
import path from 'path';
import fs from 'fs';
import { QueryInterface, Sequelize, DataTypes } from 'sequelize';

// Configuration
const migrationsDir = path.join(__dirname, '../src/migrations');

// Ensure migrations table exists
async function ensureMigrationsTable() {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable('SequelizeMeta', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
  }).catch((e) => {
    // Table may already exist
    console.log('SequelizeMeta table already exists or error:', e.message);
  });
}

// Get executed migrations
async function getExecutedMigrations(): Promise<string[]> {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const [results] = await sequelize.query('SELECT name FROM SequelizeMeta');
    return (results as any[]).map((row: any) => row.name);
  } catch (error) {
    console.error('Error getting executed migrations:', error);
    return [];
  }
}

// Main migration function
async function migrate() {
  try {
    // Ensure migrations table exists
    await ensureMigrationsTable();
    
    // Get executed migrations
    const executedMigrations = await getExecutedMigrations();
    console.log('Already executed migrations:', executedMigrations);
    
    // Read migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.ts'))
      .sort();
    
    console.log('Found migration files:', migrationFiles);
    
    // Determine pending migrations
    const pendingMigrations = migrationFiles.filter(
      file => !executedMigrations.includes(file)
    );
    
    console.log('Pending migrations:', pendingMigrations);
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return;
    }
    
    // Execute pending migrations
    for (const migrationFile of pendingMigrations) {
      console.log(`Executing migration: ${migrationFile}`);
      const migrationPath = path.join(migrationsDir, migrationFile);
      const migration = require(migrationPath);
      
      try {
        await migration.up(sequelize.getQueryInterface(), Sequelize);
        
        // Mark migration as executed
        await sequelize.query(
          'INSERT INTO SequelizeMeta (name) VALUES (?)',
          {
            replacements: [migrationFile],
            type: 'INSERT'
          }
        );
        
        console.log(`Migration ${migrationFile} executed successfully`);
      } catch (error) {
        console.error(`Error executing migration ${migrationFile}:`, error);
        throw error; // Stop migration process
      }
    }
    
    console.log('All migrations executed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run migrations
migrate(); 