import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from '../src/models';
import { Sequelize } from 'sequelize';
import path from 'path';

const umzug = new Umzug({
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
        up: async () => migration.up(context.queryInterface, context.Sequelize),
        down: async () => migration.down(context.queryInterface, context.Sequelize),
      };
    },
  },
  context: {
    queryInterface: sequelize.getQueryInterface(),
    Sequelize,
  },
  storage: new SequelizeStorage({
    sequelize,
  }),
  logger: console,
});

const cmd = process.argv[2];

if (!cmd) {
  console.error(`Missing command: Usage: ts-node migrate-ts.ts [up|down|pending|executed]`);
  process.exit(1);
}

const commands = {
  up: async () => {
    await umzug.up();
    console.log('All migrations done!');
  },
  down: async () => {
    await umzug.down();
    console.log('Migration reverted!');
  },
  pending: async () => {
    const migrations = await umzug.pending();
    console.log('Pending migrations:', migrations.map(m => m.name));
  },
  executed: async () => {
    const migrations = await umzug.executed();
    console.log('Executed migrations:', migrations.map(m => m.name));
  },
};

if (!(cmd in commands)) {
  console.error(`Invalid command '${cmd}': Usage: ts-node migrate-ts.ts [up|down|pending|executed]`);
  process.exit(1);
}

(async () => {
  try {
    await commands[cmd as keyof typeof commands]();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed!', error);
    process.exit(1);
  }
})(); 