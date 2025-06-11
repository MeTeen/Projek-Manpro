import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
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

  // Add indexes
  await queryInterface.addIndex('ticket_messages', ['ticket_id']);
  await queryInterface.addIndex('ticket_messages', ['sender_id', 'sender_type']);
  await queryInterface.addIndex('ticket_messages', ['created_at']);
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.dropTable('ticket_messages');
};
