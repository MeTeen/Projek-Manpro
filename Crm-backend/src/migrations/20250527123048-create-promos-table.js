'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('promos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      name: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('percentage', 'fixed_amount'),
        allowNull: false
      },
      value: {
        type: Sequelize.DECIMAL(10, 2), // Cocok untuk persentase atau jumlah tetap
        allowNull: false
      },
      start_date: { // Menggunakan snake_case untuk nama kolom di database
        type: Sequelize.DATE,
        allowNull: true
      },
      end_date: { // Menggunakan snake_case
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: { // Menggunakan snake_case
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      // Opsional: Untuk melacak siapa yang membuat promo
      // Sesuaikan 'admins' jika nama tabel admin Anda berbeda
      // Sesuaikan onDelete jika Anda ingin perilaku yang berbeda (misal, 'CASCADE' atau 'RESTRICT')
      created_by: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true, // Atur ke false jika wajib diisi
        references: {
          model: 'admins', // Pastikan ini adalah nama tabel admin Anda
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Jika admin dihapus, created_by menjadi NULL
      },
      created_at: { // Menggunakan snake_case
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: { // Menggunakan snake_case
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Jika Anda mengaktifkan kolom created_by, Anda mungkin ingin menambahkan indeks
    if (await queryInterface.tableExists('promos') && (await queryInterface.describeTable('promos')).created_by) {
        await queryInterface.addIndex('promos', ['created_by']);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('promos');
  }
};