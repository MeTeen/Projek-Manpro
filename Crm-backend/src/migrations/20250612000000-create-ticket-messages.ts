import { DataTypes, QueryInterface, QueryTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  // Check if table exists
  const tableExists = async (tableName: string): Promise<boolean> => {
    const result = await queryInterface.sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = '${tableName}' AND table_schema = 'public';
    `, { type: QueryTypes.SELECT });
    return result.length > 0;
  };

  // Check if indexes exist before adding them
  const indexExists = async (indexName: string): Promise<boolean> => {
    const result = await queryInterface.sequelize.query(`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'ticket_messages' AND indexname = '${indexName}';
    `, { type: QueryTypes.SELECT });
    return result.length > 0;
  };

  if (!(await tableExists('ticket_messages'))) {
    await queryInterface.createTable('ticket_messages', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ticketId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'ticket_id',
        references: {
          model: 'tickets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'sender_id',
      },
      senderType: {
        type: DataTypes.ENUM('customer', 'admin'),
        allowNull: false,
        field: 'sender_type',
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      attachmentUrls: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'attachment_urls',
        defaultValue: null,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at',
        defaultValue: DataTypes.NOW,
      },
    });

    // Add indexes only if table was just created
    await queryInterface.addIndex('ticket_messages', ['ticket_id']);
    await queryInterface.addIndex('ticket_messages', ['sender_id', 'sender_type']);
    await queryInterface.addIndex('ticket_messages', ['created_at']);
  } else {
    // If table exists, only add missing indexes
    if (!(await indexExists('ticket_messages_ticket_id'))) {
      await queryInterface.addIndex('ticket_messages', ['ticket_id']);
    }
    
    if (!(await indexExists('ticket_messages_sender_id_sender_type'))) {
      await queryInterface.addIndex('ticket_messages', ['sender_id', 'sender_type']);
    }
    
    if (!(await indexExists('ticket_messages_created_at'))) {
      await queryInterface.addIndex('ticket_messages', ['created_at']);
    }
  }
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.dropTable('ticket_messages');
};
