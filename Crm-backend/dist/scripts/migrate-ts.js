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
Object.defineProperty(exports, "__esModule", { value: true });
const umzug_1 = require("umzug");
const models_1 = require("../src/models");
const sequelize_1 = require("sequelize");
const umzug = new umzug_1.Umzug({
    migrations: {
        glob: ['../src/migrations/*.ts', { cwd: __dirname }],
        resolve: ({ name, path: migrationPath, context }) => {
            if (!migrationPath) {
                throw new Error(`Could not resolve migration path for ${name}`);
            }
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const migration = require(migrationPath);
            return {
                name,
                up: () => __awaiter(void 0, void 0, void 0, function* () { return migration.up(context.queryInterface, context.Sequelize); }),
                down: () => __awaiter(void 0, void 0, void 0, function* () { return migration.down(context.queryInterface, context.Sequelize); }),
            };
        },
    },
    context: {
        queryInterface: models_1.sequelize.getQueryInterface(),
        Sequelize: sequelize_1.Sequelize,
    },
    storage: new umzug_1.SequelizeStorage({
        sequelize: models_1.sequelize,
    }),
    logger: console,
});
const cmd = process.argv[2];
if (!cmd) {
    console.error(`Missing command: Usage: ts-node migrate-ts.ts [up|down|pending|executed]`);
    process.exit(1);
}
const commands = {
    up: () => __awaiter(void 0, void 0, void 0, function* () {
        yield umzug.up();
        console.log('All migrations done!');
    }),
    down: () => __awaiter(void 0, void 0, void 0, function* () {
        yield umzug.down();
        console.log('Migration reverted!');
    }),
    pending: () => __awaiter(void 0, void 0, void 0, function* () {
        const migrations = yield umzug.pending();
        console.log('Pending migrations:', migrations.map(m => m.name));
    }),
    executed: () => __awaiter(void 0, void 0, void 0, function* () {
        const migrations = yield umzug.executed();
        console.log('Executed migrations:', migrations.map(m => m.name));
    }),
};
if (!(cmd in commands)) {
    console.error(`Invalid command '${cmd}': Usage: ts-node migrate-ts.ts [up|down|pending|executed]`);
    process.exit(1);
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield commands[cmd]();
        process.exit(0);
    }
    catch (error) {
        console.error('Migration failed!', error);
        process.exit(1);
    }
}))();
//# sourceMappingURL=migrate-ts.js.map