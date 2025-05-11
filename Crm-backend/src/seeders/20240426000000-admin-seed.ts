import { QueryInterface } from 'sequelize';
import bcrypt from 'bcryptjs';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await queryInterface.bulkInsert('admins', [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'super_admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('admins', {});
  },
}; 