import { 
  Model, DataTypes, Optional, Sequelize,
  ModelStatic, InferAttributes, InferCreationAttributes, 
  CreationOptional, NonAttribute
} from 'sequelize';

export interface TicketAttributes {
  id: number;
  customerId: number;
  purchaseId?: number | null; // Link ke CustomerProduct untuk komplain transaksi spesifik
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'delivery' | 'product_quality' | 'payment' | 'general' | 'refund' | 'exchange';
  assignedTo?: number | null; // Admin ID yang handle ticket
  resolution?: string | null; // Solusi yang diberikan admin
  attachmentUrls?: string[] | null; // Array URL gambar/file pendukung
  firstResponseAt?: Date | null; // When admin first responded
  lastActivityAt?: Date; // Track last activity for sorting
  escalatedAt?: Date | null; // When ticket was escalated
  createdAt?: Date;
  updatedAt?: Date;
  resolvedAt?: Date | null;
}

export interface TicketInput {
  customerId: number;
  purchaseId?: number | null;
  subject: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category: 'delivery' | 'product_quality' | 'payment' | 'general' | 'refund' | 'exchange';
  attachmentUrls?: string[] | null;
}

class Ticket extends Model {
  // Model attributes
  declare id: CreationOptional<number>;
  declare customerId: number;
  declare purchaseId: number | null;
  declare subject: string;
  declare message: string;  declare status: 'open' | 'in_progress' | 'resolved' | 'closed';
  declare priority: 'low' | 'medium' | 'high' | 'urgent';
  declare category: 'delivery' | 'product_quality' | 'payment' | 'general' | 'refund' | 'exchange';
  declare assignedTo: number | null;
  declare resolution: string | null;
  declare attachmentUrls: string[] | null;
  declare firstResponseAt: Date | null;
  declare lastActivityAt: Date;
  declare escalatedAt: Date | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare resolvedAt: Date | null;

  // Virtual attributes untuk join relationships
  declare customer?: NonAttribute<any>;
  declare purchase?: NonAttribute<any>;
  declare assignedAdmin?: NonAttribute<any>;

  public static initialize(sequelize: Sequelize): typeof Ticket {
    return Ticket.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        customerId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'customers',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        purchaseId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: 'customer_products',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        subject: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false,
        },        status: {
          type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
          allowNull: false,
          defaultValue: 'open',
        },
        priority: {
          type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
          allowNull: false,
          defaultValue: 'medium',
        },
        category: {
          type: DataTypes.ENUM('delivery', 'product_quality', 'payment', 'general', 'refund', 'exchange'),
          allowNull: false,
        },
        assignedTo: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: 'admins',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        resolution: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        attachmentUrls: {
          type: DataTypes.JSON,
          allowNull: true,
        },        resolvedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        firstResponseAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        lastActivityAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        escalatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'tickets',
        timestamps: true,
        indexes: [
          {
            fields: ['customerId']
          },
          {
            fields: ['status']
          },
          {
            fields: ['priority']
          },
          {
            fields: ['category']
          },
          {
            fields: ['assignedTo']
          },
          {
            fields: ['createdAt']
          }
        ]
      }
    );
  }
}

export default Ticket;
