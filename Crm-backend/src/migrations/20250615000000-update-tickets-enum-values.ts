import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: any) {
    const transaction = await queryInterface.sequelize.transaction();
      try {
      // Helper functions for checking existence
      const enumExists = async (enumName: string): Promise<boolean> => {
        const result = await queryInterface.sequelize.query(`
          SELECT typname FROM pg_type WHERE typname = '${enumName}';
        `, { type: QueryTypes.SELECT, transaction });
        return result.length > 0;
      };

      const enumHasValue = async (enumName: string, value: string): Promise<boolean> => {
        const result = await queryInterface.sequelize.query(`
          SELECT enumlabel FROM pg_enum e
          JOIN pg_type t ON e.enumtypid = t.oid
          WHERE t.typname = '${enumName}' AND e.enumlabel = '${value}';
        `, { type: QueryTypes.SELECT, transaction });
        return result.length > 0;
      };      // 1. Update enum values for status (from title case to lowercase)
      if (await enumExists('enum_tickets_status') && !(await enumHasValue('enum_tickets_status', 'open'))) {
        // First, remove the default constraint
        await queryInterface.sequelize.query(`
          ALTER TABLE tickets ALTER COLUMN status DROP DEFAULT;
        `, { transaction });

        await queryInterface.sequelize.query(`
          ALTER TYPE "enum_tickets_status" RENAME TO "enum_tickets_status_old";
        `, { transaction });
        
        await queryInterface.sequelize.query(`
          CREATE TYPE "enum_tickets_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');
        `, { transaction });
          await queryInterface.sequelize.query(`
          ALTER TABLE tickets ALTER COLUMN status TYPE "enum_tickets_status" 
          USING 
            CASE 
              WHEN status = 'Open' THEN 'open'
              WHEN status = 'In Progress' THEN 'in_progress'
              WHEN status = 'Resolved' THEN 'resolved'
              WHEN status = 'Closed' THEN 'closed'
              ELSE 'open'
            END::"enum_tickets_status";
        `, { transaction });
        
        await queryInterface.sequelize.query(`
          DROP TYPE "enum_tickets_status_old";
        `, { transaction });

        // Set new default value with lowercase
        await queryInterface.sequelize.query(`
          ALTER TABLE tickets ALTER COLUMN status SET DEFAULT 'open'::"enum_tickets_status";
        `, { transaction });
      }      // 2. Update enum values for priority (from title case to lowercase)
      if (await enumExists('enum_tickets_priority') && !(await enumHasValue('enum_tickets_priority', 'low'))) {
        // First, remove the default constraint
        await queryInterface.sequelize.query(`
          ALTER TABLE tickets ALTER COLUMN priority DROP DEFAULT;
        `, { transaction });

        await queryInterface.sequelize.query(`
          ALTER TYPE "enum_tickets_priority" RENAME TO "enum_tickets_priority_old";
        `, { transaction });
        
        await queryInterface.sequelize.query(`
          CREATE TYPE "enum_tickets_priority" AS ENUM('low', 'medium', 'high', 'urgent');
        `, { transaction });
          await queryInterface.sequelize.query(`
          ALTER TABLE tickets ALTER COLUMN priority TYPE "enum_tickets_priority" 
          USING 
            CASE 
              WHEN priority = 'Low' THEN 'low'
              WHEN priority = 'Medium' THEN 'medium'
              WHEN priority = 'High' THEN 'high'
              WHEN priority = 'Urgent' THEN 'urgent'
              ELSE 'medium'
            END::"enum_tickets_priority";
        `, { transaction });
        
        await queryInterface.sequelize.query(`
          DROP TYPE "enum_tickets_priority_old";
        `, { transaction });

        // Set new default value with lowercase
        await queryInterface.sequelize.query(`
          ALTER TABLE tickets ALTER COLUMN priority SET DEFAULT 'medium'::"enum_tickets_priority";
        `, { transaction });
      }

      // 3. Update enum values for category (from title case to snake_case)
      if (await enumExists('enum_tickets_category') && !(await enumHasValue('enum_tickets_category', 'product_quality'))) {
        await queryInterface.sequelize.query(`
          ALTER TYPE "enum_tickets_category" RENAME TO "enum_tickets_category_old";
        `, { transaction });
        
        await queryInterface.sequelize.query(`
          CREATE TYPE "enum_tickets_category" AS ENUM('delivery', 'product_quality', 'payment', 'general', 'refund', 'exchange');
        `, { transaction });
        
        await queryInterface.sequelize.query(`
          ALTER TABLE tickets ALTER COLUMN category TYPE "enum_tickets_category" 
          USING 
            CASE 
              WHEN category = 'Delivery' THEN 'delivery'
              WHEN category = 'Product Quality' THEN 'product_quality'
              WHEN category = 'Payment' THEN 'payment'
              WHEN category = 'General' THEN 'general'
              WHEN category = 'Refund' THEN 'refund'
              WHEN category = 'Exchange' THEN 'exchange'
              ELSE 'general'
            END::"enum_tickets_category";
        `, { transaction });
        
        await queryInterface.sequelize.query(`
          DROP TYPE "enum_tickets_category_old";
        `, { transaction });
      }// 4. Add new tracking columns (check if they exist first)
      const columnExists = async (columnName: string): Promise<boolean> => {
        const result = await queryInterface.sequelize.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'tickets' AND column_name = '${columnName}';
        `, { type: QueryTypes.SELECT, transaction });
        return result.length > 0;
      };

      // Add firstResponseAt if it doesn't exist
      if (!(await columnExists('firstResponseAt'))) {
        await queryInterface.addColumn('tickets', 'firstResponseAt', {
          type: DataTypes.DATE,
          allowNull: true,
        }, { transaction });
      }      // Add lastActivityAt if it doesn't exist
      if (!(await columnExists('lastActivityAt'))) {
        await queryInterface.addColumn('tickets', 'lastActivityAt', {
          type: DataTypes.DATE,
          allowNull: true, // Initially allow null
        }, { transaction });

        // Update existing records to set lastActivityAt to updatedAt
        await queryInterface.sequelize.query(`
          UPDATE tickets SET "lastActivityAt" = "updatedAt" WHERE "lastActivityAt" IS NULL;
        `, { transaction });

        // Now make it NOT NULL
        await queryInterface.sequelize.query(`
          ALTER TABLE tickets ALTER COLUMN "lastActivityAt" SET NOT NULL;
        `, { transaction });
      }

      // Add escalatedAt if it doesn't exist
      if (!(await columnExists('escalatedAt'))) {
        await queryInterface.addColumn('tickets', 'escalatedAt', {
          type: DataTypes.DATE,
          allowNull: true,
        }, { transaction });      }

      // 6. Add indexes for performance (check if they exist first)
      const indexExists = async (indexName: string): Promise<boolean> => {
        const result = await queryInterface.sequelize.query(`
          SELECT indexname FROM pg_indexes 
          WHERE tablename = 'tickets' AND indexname = '${indexName}';
        `, { type: QueryTypes.SELECT, transaction });
        return result.length > 0;
      };

      // Add lastActivityAt index if it doesn't exist
      if (!(await indexExists('idx_tickets_last_activity'))) {
        await queryInterface.addIndex('tickets', ['lastActivityAt'], {
          name: 'idx_tickets_last_activity',
          transaction
        });
      }

      // Add firstResponseAt index if it doesn't exist
      if (!(await indexExists('idx_tickets_first_response'))) {
        await queryInterface.addIndex('tickets', ['firstResponseAt'], {
          name: 'idx_tickets_first_response',
          transaction
        });
      }

      // Add escalatedAt index if it doesn't exist
      if (!(await indexExists('idx_tickets_escalated'))) {
        await queryInterface.addIndex('tickets', ['escalatedAt'], {
          name: 'idx_tickets_escalated',
          transaction
        });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface: QueryInterface, Sequelize: any) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove new columns
      await queryInterface.removeColumn('tickets', 'firstResponseAt', { transaction });
      await queryInterface.removeColumn('tickets', 'lastActivityAt', { transaction });
      await queryInterface.removeColumn('tickets', 'escalatedAt', { transaction });

      // Revert enum changes (back to title case)
      // Status
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_tickets_status" RENAME TO "enum_tickets_status_old";
      `, { transaction });
      
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_tickets_status" AS ENUM('Open', 'In Progress', 'Resolved', 'Closed');
      `, { transaction });
      
      await queryInterface.sequelize.query(`
        ALTER TABLE tickets ALTER COLUMN status TYPE "enum_tickets_status" 
        USING 
          CASE 
            WHEN status = 'open' THEN 'Open'
            WHEN status = 'in_progress' THEN 'In Progress'
            WHEN status = 'resolved' THEN 'Resolved'
            WHEN status = 'closed' THEN 'Closed'
            ELSE 'Open'
          END::"enum_tickets_status";
      `, { transaction });
      
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_tickets_status_old";
      `, { transaction });

      // Priority
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_tickets_priority" RENAME TO "enum_tickets_priority_old";
      `, { transaction });
      
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_tickets_priority" AS ENUM('Low', 'Medium', 'High', 'Urgent');
      `, { transaction });
      
      await queryInterface.sequelize.query(`
        ALTER TABLE tickets ALTER COLUMN priority TYPE "enum_tickets_priority" 
        USING 
          CASE 
            WHEN priority = 'low' THEN 'Low'
            WHEN priority = 'medium' THEN 'Medium'
            WHEN priority = 'high' THEN 'High'
            WHEN priority = 'urgent' THEN 'Urgent'
            ELSE 'Medium'
          END::"enum_tickets_priority";
      `, { transaction });
      
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_tickets_priority_old";
      `, { transaction });

      // Category
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_tickets_category" RENAME TO "enum_tickets_category_old";
      `, { transaction });
      
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_tickets_category" AS ENUM('Delivery', 'Product Quality', 'Payment', 'General', 'Refund', 'Exchange');
      `, { transaction });
      
      await queryInterface.sequelize.query(`
        ALTER TABLE tickets ALTER COLUMN category TYPE "enum_tickets_category" 
        USING 
          CASE 
            WHEN category = 'delivery' THEN 'Delivery'
            WHEN category = 'product_quality' THEN 'Product Quality'
            WHEN category = 'payment' THEN 'Payment'
            WHEN category = 'general' THEN 'General'
            WHEN category = 'refund' THEN 'Refund'
            WHEN category = 'exchange' THEN 'Exchange'
            ELSE 'General'
          END::"enum_tickets_category";
      `, { transaction });
      
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_tickets_category_old";
      `, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
