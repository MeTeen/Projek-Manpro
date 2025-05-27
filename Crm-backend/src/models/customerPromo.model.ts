// src/models/customerPromo.model.ts
import {
  Model, DataTypes, Sequelize,
  CreationOptional, InferAttributes, InferCreationAttributes, ForeignKey
} from 'sequelize';
import Admin from './admin.model';
import Customer from './customer.model';
import Promo from './promo.model';

export interface CustomerPromoAttributes {
  id: number;
  customerId: ForeignKey<Customer['id']>;
  promoId: ForeignKey<Promo['id']>;
  assignedBy?: ForeignKey<Admin['id']>; // Siapa admin yang assign
  isUsed?: boolean; // Jika promo hanya bisa dipakai sekali per customer
  usedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

class CustomerPromo extends Model<InferAttributes<CustomerPromo>, InferCreationAttributes<CustomerPromo>> {
  declare id: CreationOptional<number>;
  declare customerId: ForeignKey<Customer['id']>;
  declare promoId: ForeignKey<Promo['id']>;
  declare assignedBy: ForeignKey<Admin['id']> | null;
  declare isUsed: CreationOptional<boolean>;
  declare usedAt: Date | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  public static initialize(sequelize: Sequelize): typeof CustomerPromo {
    return CustomerPromo.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        customerId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: { model: 'customers', key: 'id' },
          field: 'customer_id'
        },
        promoId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: { model: 'promos', key: 'id' },
          field: 'promo_id'
        },
        assignedBy: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true, // atau false jika wajib
          references: { model: 'admins', key: 'id' },
          field: 'assigned_by'
        },
        isUsed: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          field: 'is_used'
        },
        usedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'used_at'
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
        tableName: 'customer_promos',
        sequelize,
        underscored: true,
        indexes: [
          {
            unique: false, // Satu customer hanya bisa punya satu jenis promo yang sama (jika diperlukan)
                            // Jika satu customer bisa punya promo yang sama berkali-kali (misal voucher), set unique: false
            fields: ['customer_id', 'promo_id']
          }
        ]
      }
    );
  }
}
export default CustomerPromo;