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
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  category: 'Delivery' | 'Product Quality' | 'Payment' | 'General' | 'Refund' | 'Exchange';
  assignedTo?: number | null; // Admin ID yang handle ticket
  resolution?: string | null; // Solusi yang diberikan admin
  attachmentUrls?: string[] | null; // Array URL gambar/file pendukung
  createdAt?: Date;
  updatedAt?: Date;
  resolvedAt?: Date | null;
}

export interface TicketInput {
  customerId: number;
  purchaseId?: number | null;
  subject: string;
  message: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  category: 'Delivery' | 'Product Quality' | 'Payment' | 'General' | 'Refund' | 'Exchange';
  attachmentUrls?: string[] | null;
}

class Ticket extends Model {
  // Model attributes
  declare id: CreationOptional<number>;
  declare customerId: number;
  declare purchaseId: number | null;
  declare subject: string;
  declare message: string;
  declare status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  declare priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  declare category: 'Delivery' | 'Product Quality' | 'Payment' | 'General' | 'Refund' | 'Exchange';
  declare assignedTo: number | null;
  declare resolution: string | null;
  declare attachmentUrls: string[] | null;
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
        },
        status: {
          type: DataTypes.ENUM('Open', 'In Progress', 'Resolved', 'Closed'),
          allowNull: false,
          defaultValue: 'Open',
        },
        priority: {
          type: DataTypes.ENUM('Low', 'Medium', 'High', 'Urgent'),
          allowNull: false,
          defaultValue: 'Medium',
        },
        category: {
          type: DataTypes.ENUM('Delivery', 'Product Quality', 'Payment', 'General', 'Refund', 'Exchange'),
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
        },
        resolvedAt: {
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
