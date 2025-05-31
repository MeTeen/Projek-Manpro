// scripts/seed-ts.ts
import { QueryInterface } from 'sequelize';
import { sequelize } from '../src/models';
import * as path from 'path';
import * as fs from 'fs';

async function runSeeders(): Promise<void> {
  try {
    console.log('🌱 Starting TypeScript seeders...');
    
    // Get QueryInterface from sequelize
    const queryInterface: QueryInterface = sequelize.getQueryInterface();
    
    // Define seeders directory
    const seedersDir = path.join(__dirname, '../src/seeders');
    
    // Get all TypeScript seeder files
    const seederFiles = fs.readdirSync(seedersDir)
      .filter(file => file.endsWith('.ts'))
      .sort(); // Sort to run in chronological order
    
    console.log(`Found ${seederFiles.length} TypeScript seeder files:`, seederFiles);
    
    for (const file of seederFiles) {
      const seederPath = path.join(seedersDir, file);
      console.log(`\n📄 Running seeder: ${file}`);
      
      try {
        // Clear require cache to ensure fresh module load
        delete require.cache[require.resolve(seederPath)];
        
        // Import the seeder module
        const seederModule = require(seederPath);
        
        // Check if it has an 'up' method
        if (seederModule && typeof seederModule.up === 'function') {
          await seederModule.up(queryInterface, sequelize);
          console.log(`✅ Successfully completed seeder: ${file}`);
        } else {
          console.warn(`⚠️  Seeder ${file} does not have an 'up' method`);
        }
      } catch (error) {
        console.error(`❌ Error running seeder ${file}:`, error);
        throw error; // Stop execution on error
      }
    }
    
    console.log('\n🎉 All TypeScript seeders completed successfully!');
  } catch (error) {
    console.error('💥 Failed to run seeders:', error);
    throw error;
  }
}

async function revertSeeders(): Promise<void> {
  try {
    console.log('🔄 Reverting TypeScript seeders...');
    
    // Get QueryInterface from sequelize
    const queryInterface: QueryInterface = sequelize.getQueryInterface();
    
    // Define seeders directory
    const seedersDir = path.join(__dirname, '../src/seeders');
    
    // Get all TypeScript seeder files in reverse order
    const seederFiles = fs.readdirSync(seedersDir)
      .filter(file => file.endsWith('.ts'))
      .sort()
      .reverse(); // Reverse order for rollback
    
    console.log(`Found ${seederFiles.length} TypeScript seeder files to revert:`, seederFiles);
    
    for (const file of seederFiles) {
      const seederPath = path.join(seedersDir, file);
      console.log(`\n📄 Reverting seeder: ${file}`);
      
      try {
        // Clear require cache to ensure fresh module load
        delete require.cache[require.resolve(seederPath)];
        
        // Import the seeder module
        const seederModule = require(seederPath);
        
        // Check if it has a 'down' method
        if (seederModule && typeof seederModule.down === 'function') {
          await seederModule.down(queryInterface, sequelize);
          console.log(`✅ Successfully reverted seeder: ${file}`);
        } else {
          console.warn(`⚠️  Seeder ${file} does not have a 'down' method`);
        }
      } catch (error) {
        console.error(`❌ Error reverting seeder ${file}:`, error);
        throw error; // Stop execution on error
      }
    }
    
    console.log('\n🎉 All TypeScript seeders reverted successfully!');
  } catch (error) {
    console.error('💥 Failed to revert seeders:', error);
    throw error;
  }
}

// Main execution logic
async function main(): Promise<void> {
  const command = process.argv[2];
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    switch (command) {
      case 'up':
      case 'seed':
        await runSeeders();
        break;
      case 'down':
      case 'revert':
        await revertSeeders();
        break;
      default:
        console.log(`
Usage: npm run seed:ts [command]

Commands:
  up, seed    - Run all TypeScript seeders
  down, revert - Revert all TypeScript seeders

Examples:
  npm run seed:ts up
  npm run seed:ts down
        `);
        process.exit(1);
    }
  } catch (error) {
    console.error('💥 Database operation failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('🔐 Database connection closed.');
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { runSeeders, revertSeeders };