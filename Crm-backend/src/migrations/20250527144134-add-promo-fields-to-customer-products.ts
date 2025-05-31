// Crm-backend\src\migrations\YYYYMMDDHHMMSS-add-promo-fields-to-customer-products.ts
'use strict';
import { QueryInterface, DataTypes, Sequelize } from 'sequelize'; // Impor tipe jika diperlukan untuk IntelliSense

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Sequelize) { // Tambahkan tipe jika diinginkan
    // Tambahkan kolom promo_id
    await queryInterface.addColumn('customer_products', 'promo_id', {
      type: DataTypes.INTEGER, // Gunakan DataTypes dari argumen Sequelize
      allowNull: true,
      references: {
        model: 'promos',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Tambahkan kolom discount_amount
    await queryInterface.addColumn('customer_products', 'discount_amount', {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    });
  },

  async down(queryInterface: QueryInterface, Sequelize: Sequelize) { // Tambahkan tipe jika diinginkan
    await queryInterface.removeColumn('customer_products', 'discount_amount');
    await queryInterface.removeColumn('customer_products', 'promo_id');
  }
};