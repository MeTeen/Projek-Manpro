"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeeders = runSeeders;
exports.revertSeeders = revertSeeders;
const models_1 = require("../src/models");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
function runSeeders() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🌱 Starting TypeScript seeders...');
            // Get QueryInterface from sequelize
            const queryInterface = models_1.sequelize.getQueryInterface();
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
                        yield seederModule.up(queryInterface, models_1.sequelize);
                        console.log(`✅ Successfully completed seeder: ${file}`);
                    }
                    else {
                        console.warn(`⚠️  Seeder ${file} does not have an 'up' method`);
                    }
                }
                catch (error) {
                    console.error(`❌ Error running seeder ${file}:`, error);
                    throw error; // Stop execution on error
                }
            }
            console.log('\n🎉 All TypeScript seeders completed successfully!');
        }
        catch (error) {
            console.error('💥 Failed to run seeders:', error);
            throw error;
        }
    });
}
function revertSeeders() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🔄 Reverting TypeScript seeders...');
            // Get QueryInterface from sequelize
            const queryInterface = models_1.sequelize.getQueryInterface();
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
                        yield seederModule.down(queryInterface, models_1.sequelize);
                        console.log(`✅ Successfully reverted seeder: ${file}`);
                    }
                    else {
                        console.warn(`⚠️  Seeder ${file} does not have a 'down' method`);
                    }
                }
                catch (error) {
                    console.error(`❌ Error reverting seeder ${file}:`, error);
                    throw error; // Stop execution on error
                }
            }
            console.log('\n🎉 All TypeScript seeders reverted successfully!');
        }
        catch (error) {
            console.error('💥 Failed to revert seeders:', error);
            throw error;
        }
    });
}
// Main execution logic
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const command = process.argv[2];
        try {
            // Test database connection
            yield models_1.sequelize.authenticate();
            console.log('✅ Database connection established successfully.');
            switch (command) {
                case 'up':
                case 'seed':
                    yield runSeeders();
                    break;
                case 'down':
                case 'revert':
                    yield revertSeeders();
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
        }
        catch (error) {
            console.error('💥 Database operation failed:', error);
            process.exit(1);
        }
        finally {
            // Close database connection
            yield models_1.sequelize.close();
            console.log('🔐 Database connection closed.');
        }
    });
}
// Run the script
if (require.main === module) {
    main();
}
//# sourceMappingURL=seed-ts.js.map