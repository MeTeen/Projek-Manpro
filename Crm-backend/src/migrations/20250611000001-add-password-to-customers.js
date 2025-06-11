'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('customers', 'password', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: '' // Temporary default, will be set by seeder
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('customers', 'password');
  },
};
