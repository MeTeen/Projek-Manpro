import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // First, check if the table exists
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('customers')) {
      // Create the table if it doesn't exist
      await queryInterface.createTable('customers', {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        firstName: {
          type: DataTypes.STRING(64),
          allowNull: false,
          field: 'first_name'
        },
        lastName: {
          type: DataTypes.STRING(64),
          allowNull: false,
          field: 'last_name'
        },
        email: {
          type: DataTypes.STRING(128),
          allowNull: false,
          unique: true,
        },
        phone: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        address: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        city: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        state: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        zipCode: {
          type: DataTypes.STRING(20),
          allowNull: false,
          field: 'zip_code'
        },
        avatarUrl: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'avatar_url'
        },
        totalSpent: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
          field: 'total_spent'
        },
        purchaseCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'purchase_count'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'created_at'
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'updated_at'
        },
      });
      return;
    }

    // If we have an existing table with 'name', we need to restructure it
    const tableInfo = await queryInterface.describeTable('customers');
    
    // Check if we need to split 'name' into 'first_name' and 'last_name'
    if (tableInfo.name && !tableInfo.first_name && !tableInfo.last_name) {
      // Add the new columns
      await queryInterface.addColumn('customers', 'first_name', {
        type: DataTypes.STRING(64),
        allowNull: true, // Initially allow null to perform data migration
      });
      await queryInterface.addColumn('customers', 'last_name', {
        type: DataTypes.STRING(64),
        allowNull: true, // Initially allow null to perform data migration
      });
      
      // Update the data from 'name' to 'first_name' and 'last_name'
      await queryInterface.sequelize.query(`
        UPDATE customers 
        SET first_name = SUBSTRING_INDEX(name, ' ', 1),
            last_name = SUBSTRING_INDEX(name, ' ', -1)
      `);
      
      // Make the columns non-nullable after migration
      await queryInterface.changeColumn('customers', 'first_name', {
        type: DataTypes.STRING(64),
        allowNull: false,
      });
      await queryInterface.changeColumn('customers', 'last_name', {
        type: DataTypes.STRING(64),
        allowNull: false,
      });
      
      // Remove the old 'name' column
      await queryInterface.removeColumn('customers', 'name');
    }
    
    // Add missing columns if they don't exist
    if (!tableInfo.city) {
      await queryInterface.addColumn('customers', 'city', {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: '',
      });
    }
    
    if (!tableInfo.state) {
      await queryInterface.addColumn('customers', 'state', {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: '',
      });
    }
    
    if (!tableInfo.zip_code) {
      await queryInterface.addColumn('customers', 'zip_code', {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: '',
      });
    }
    
    if (!tableInfo.avatar_url) {
      await queryInterface.addColumn('customers', 'avatar_url', {
        type: DataTypes.STRING(255),
        allowNull: true,
      });
    }
    
    // We'll use separate migration for total_spent and purchase_count
  },

  down: async (queryInterface: QueryInterface) => {
    // This is a complex migration that's hard to reverse, so we'll just provide a warning
    console.warn('This migration cannot be fully reversed automatically.');
    
    // If needed, you could try to merge first_name and last_name back to name and remove the other fields
    const tableInfo = await queryInterface.describeTable('customers');
    
    if (tableInfo.first_name && tableInfo.last_name && !tableInfo.name) {
      // Add the name column
      await queryInterface.addColumn('customers', 'name', {
        type: DataTypes.STRING(128),
        allowNull: true,
      });
      
      // Merge the first_name and last_name into name
      await queryInterface.sequelize.query(`
        UPDATE customers 
        SET name = CONCAT(first_name, ' ', last_name)
      `);
      
      // Make name non-nullable
      await queryInterface.changeColumn('customers', 'name', {
        type: DataTypes.STRING(128),
        allowNull: false,
      });
      
      // Remove the split name columns
      await queryInterface.removeColumn('customers', 'first_name');
      await queryInterface.removeColumn('customers', 'last_name');
    }
    
    // Remove the added columns
    const columnsToRemove = ['city', 'state', 'zip_code', 'avatar_url'];
    for (const column of columnsToRemove) {
      if (tableInfo[column]) {
        await queryInterface.removeColumn('customers', column);
      }
    }
  }
}; 