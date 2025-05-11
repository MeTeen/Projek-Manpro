import { 
  Model, DataTypes, Optional, Sequelize,
  ModelStatic, InferAttributes, InferCreationAttributes, 
  CreationOptional, NonAttribute
} from 'sequelize';

export interface CustomerAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  avatarUrl: string | null;
  totalSpent: number;
  purchaseCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  avatarUrl?: string | null;
  totalSpent?: number;
  purchaseCount?: number;
}

class Customer extends Model {
  // These are model attributes
  declare id: CreationOptional<number>;
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare phone: string;
  declare address: string;
  declare city: string;
  declare state: string;
  declare zipCode: string;
  declare avatarUrl: string | null;
  declare totalSpent: number;
  declare purchaseCount: number;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Class method for model initialization
  public static initialize(sequelize: Sequelize): typeof Customer {
    return Customer.init(
      {
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
          validate: {
            isEmail: true,
          },
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
      },
      {
        tableName: 'customers',
        sequelize,
        underscored: true, // This will automatically convert camelCase to snake_case
      }
    );
  }
}

export default Customer; 