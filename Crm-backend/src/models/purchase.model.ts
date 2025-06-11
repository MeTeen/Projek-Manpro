import { 
  Model, DataTypes, Optional, Sequelize,
  ModelStatic, InferAttributes, InferCreationAttributes, 
  CreationOptional, NonAttribute, ForeignKey
} from 'sequelize';
import type Customer from './customer.model';
import type Product from './product.model';
import type Promo from './promo.model';

export interface PurchaseAttributes {
  id: number;
  customerId: number;
  productId: number;
  quantity: number;
  unitPrice: number; // Price per unit at time of purchase
  totalAmount: number; // unitPrice * quantity
  discountAmount: number; // Discount applied
  finalAmount: number; // totalAmount - discountAmount
  promoId?: number | null;
  purchaseDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PurchaseInput extends Omit<PurchaseAttributes, 'id' | 'createdAt' | 'updatedAt' | 'totalAmount' | 'finalAmount'> {
  totalAmount?: number;
  finalAmount?: number;
}

class Purchase extends Model<InferAttributes<Purchase>, InferCreationAttributes<Purchase>> {
  // Model attributes
  declare id: CreationOptional<number>;
  declare customerId: ForeignKey<Customer['id']>;
  declare productId: ForeignKey<Product['id']>;
  declare quantity: number;
  declare unitPrice: number;
  declare totalAmount: number;
  declare discountAmount: number;
  declare finalAmount: number;
  declare promoId: ForeignKey<Promo['id']> | null;
  declare purchaseDate: Date;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Virtual attributes for relationships
  declare customer?: NonAttribute<Customer>;
  declare product?: NonAttribute<Product>;
  declare promo?: NonAttribute<Promo>;

  // Class method for model initialization
  public static initialize(sequelize: Sequelize): typeof Purchase {
    return Purchase.init(
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
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT', // Prevent deletion of customer with purchases
          field: 'customer_id'
        },
        productId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT', // Prevent deletion of product with purchases
          field: 'product_id'
        },
        quantity: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          validate: {
            min: 1
          }
        },
        unitPrice: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          validate: {
            min: 0
          },
          field: 'unit_price'
        },
        totalAmount: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          validate: {
            min: 0
          },
          field: 'total_amount'
        },
        discountAmount: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
          validate: {
            min: 0
          },
          field: 'discount_amount'
        },
        finalAmount: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          validate: {
            min: 0
          },
          field: 'final_amount'
        },
        promoId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: 'promos',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          field: 'promo_id'
        },
        purchaseDate: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'purchase_date'
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
        }
      },
      {
        sequelize,
        tableName: 'purchases',
        timestamps: true,
        indexes: [
          {
            fields: ['customer_id']
          },
          {
            fields: ['product_id']
          },
          {
            fields: ['promo_id']
          },
          {
            fields: ['purchase_date']
          },
          {
            fields: ['created_at']
          },
          // Composite indexes for common queries
          {
            fields: ['customer_id', 'purchase_date']
          },
          {
            fields: ['product_id', 'purchase_date']
          }
        ],
        // Add hooks for auto-calculation
        hooks: {
          beforeCreate: (purchase: Purchase) => {
            purchase.totalAmount = purchase.unitPrice * purchase.quantity;
            purchase.finalAmount = purchase.totalAmount - (purchase.discountAmount || 0);
          },
          beforeUpdate: (purchase: Purchase) => {
            if (purchase.changed('unitPrice') || purchase.changed('quantity') || purchase.changed('discountAmount')) {
              purchase.totalAmount = purchase.unitPrice * purchase.quantity;
              purchase.finalAmount = purchase.totalAmount - (purchase.discountAmount || 0);
            }
          }
        }
      }
    );
  }
}

export default Purchase;
