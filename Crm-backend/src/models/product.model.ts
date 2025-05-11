import { 
  Model, DataTypes, Optional, Sequelize,
  ModelStatic, InferAttributes, InferCreationAttributes, 
  CreationOptional, NonAttribute
} from 'sequelize';

export interface ProductAttributes {
  id: number;
  name: string;
  stock: number;
  price: number;
  dimensions: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductInput {
  name: string;
  stock: number;
  price: number;
  dimensions: string;
}

class Product extends Model {
  // These are model attributes
  declare id: CreationOptional<number>;
  declare name: string;
  declare stock: number;
  declare price: number;
  declare dimensions: string;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Class method for model initialization
  public static initialize(sequelize: Sequelize): typeof Product {
    return Product.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(128),
          allowNull: false,
        },
        stock: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },
        dimensions: {
          type: DataTypes.STRING(128),
          allowNull: true,
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
        tableName: 'products',
        sequelize,
        underscored: true, // Use snake_case for all database column names
      }
    );
  }
}

export default Product; 