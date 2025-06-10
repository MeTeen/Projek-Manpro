import { QueryInterface } from 'sequelize';
import bcrypt from 'bcrypt';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const hashedPassword = await bcrypt.hash('superadmin123', 10);

    await queryInterface.bulkInsert('users', [
      {
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: hashedPassword,
        role: 'super_admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('users', { email: 'superadmin@example.com' }, {});
  },
};
