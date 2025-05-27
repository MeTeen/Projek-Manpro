// src/models/promo.model.ts
import {
  Model, DataTypes, Sequelize,
  CreationOptional, InferAttributes, InferCreationAttributes, ForeignKey
} from 'sequelize';
import Admin from './admin.model';

export interface PromoAttributes {
  id: number;
  name: string;
  description?: string | null;
  type: 'percentage' | 'fixed_amount';
  value: number;
  startDate?: Date | null;
  endDate?: Date | null;
  isActive: boolean;
  createdBy?: ForeignKey<Admin['id']>; // Opsional, tapi baik untuk audit
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PromoInput extends Omit<PromoAttributes, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> {
  isActive?: boolean;
}

class Promo extends Model<InferAttributes<Promo>, InferCreationAttributes<Promo>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string | null;
  declare type: 'percentage' | 'fixed_amount';
  declare value: number;
  declare startDate: Date | null;
  declare endDate: Date | null;
  declare isActive: boolean;
  declare createdBy: ForeignKey<Admin['id']> | null; // Sesuaikan jika mandatory
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  public static initialize(sequelize: Sequelize): typeof Promo {
    return Promo.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(128),
          allowNull: false,
          unique: true,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        type: {
          type: DataTypes.ENUM('percentage', 'fixed_amount'),
          allowNull: false,
        },
        value: {
          type: DataTypes.DECIMAL(10, 2), // Atau INTEGER jika tidak butuh desimal untuk fixed_amount
          allowNull: false,
        },
        startDate: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'start_date'
        },
        endDate: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'end_date'
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          field: 'is_active'
        },
        createdBy: { // Jika ingin melacak siapa pembuat promo
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false, // atau false jika wajib
          references: {
            model: 'admins', // nama tabel admin
            key: 'id',
          },
          field: 'created_by'
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
        tableName: 'promos',
        sequelize,
        underscored: true,
      }
    );
  }
}

export default Promo;