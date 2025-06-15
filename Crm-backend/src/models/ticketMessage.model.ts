import { 
  Model, DataTypes, Optional, Sequelize,
  ModelStatic, InferAttributes, InferCreationAttributes, 
  CreationOptional, NonAttribute
} from 'sequelize';

export interface TicketMessageAttributes {
  id: number;
  ticketId: number;
  senderId: number;
  senderType: 'customer' | 'admin';
  message: string;
  attachmentUrls?: string[] | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TicketMessageInput {
  ticketId: number;
  senderId: number;
  senderType: 'customer' | 'admin';
  message: string;
  attachmentUrls?: string[] | null;
}

class TicketMessage extends Model<TicketMessageAttributes, TicketMessageInput> {
  // Model attributes
  declare id: CreationOptional<number>;
  declare ticketId: number;
  declare senderId: number;
  declare senderType: 'customer' | 'admin';
  declare message: string;
  declare attachmentUrls: string[] | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Virtual attributes untuk join relationships
  declare sender?: NonAttribute<any>;
  declare ticket?: NonAttribute<any>;

  static associate(models: any) {
    // Relationship dengan Ticket
    TicketMessage.belongsTo(models.Ticket, {
      foreignKey: 'ticketId',
      as: 'ticket'
    });    // Polymorphic relationship dengan Customer dan Admin
    TicketMessage.belongsTo(models.Customer, {
      foreignKey: 'senderId',
      constraints: false,
      as: 'customerSender'
    });

    TicketMessage.belongsTo(models.Admin, {
      foreignKey: 'senderId',
      constraints: false,
      as: 'adminSender'
    });
  }

  static initModel(sequelize: Sequelize): ModelStatic<TicketMessage> {
    TicketMessage.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },        ticketId: {
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
        },        attachmentUrls: {
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
      },
      {
        sequelize,
        tableName: 'ticket_messages',        timestamps: true,
        indexes: [
          {
            fields: ['ticket_id']
          },
          {
            fields: ['sender_id', 'sender_type']
          },
          {
            fields: ['created_at']
          }
        ]
      }
    );

    return TicketMessage;
  }
}

export default TicketMessage;
