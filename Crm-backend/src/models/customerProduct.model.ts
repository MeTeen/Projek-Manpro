import { 
  Model, DataTypes, Optional, Sequelize,
  ModelStatic, InferAttributes, InferCreationAttributes, 
  CreationOptional, NonAttribute
} from 'sequelize';

export interface CustomerProductAttributes {
  id: number;
  customerId: number;
  productId: number;
  quantity: number;
  price: number;
  purchaseDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
  promoId?: number | null; // ID promo yang digunakan
  discountAmount?: number; // Jumlah diskon yang diberikan
}

export interface CustomerProductInput {
  customerId: number;
  productId: number;
  quantity: number;
  price: number;
  purchaseDate?: Date;
  promoId?: number | null;
  discountAmount?: number;
}

class CustomerProduct extends Model {
  // These are model attributes
  declare id: CreationOptional<number>;
  declare customerId: number;
  declare productId: number;
  declare quantity: number;
  declare price: number;
  declare purchaseDate: Date;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare promoId: number | null;
  declare discountAmount: number | null;

  // Class method for model initialization
  public static initialize(sequelize: Sequelize): typeof CustomerProduct {
    return CustomerProduct.init(
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
            key: 'id'
          },
          field: 'customer_id'
        },
        productId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id'
          },
          field: 'product_id' 
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1
        },
        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0
        },
        purchaseDate: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'purchase_date'
        },

        promoId: { // [TAMBAHKAN INI]
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: 'promos', // Nama tabel promo
            key: 'id'
          },
          field: 'promo_id'
        },
        discountAmount: { // [TAMBAHKAN INI]
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
          defaultValue: 0,
          field: 'discount_amount'
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
        tableName: 'customer_products',
        sequelize,
        indexes: [
          {
            unique: false,
            fields: ['customer_id', 'product_id']
          }
        ]
      }
    );
  }
}

export default CustomerProduct; 