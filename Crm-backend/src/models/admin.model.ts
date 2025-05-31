import { 
  Model, DataTypes, Optional, Sequelize, 
  ModelStatic, InferAttributes, InferCreationAttributes, 
  CreationOptional, NonAttribute
} from 'sequelize';
import bcrypt from 'bcryptjs';

export interface AdminAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'super_admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdminInput {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'super_admin';
}

class Admin extends Model {
  // These are model attributes
  declare id: CreationOptional<number>;
  declare username: string;
  declare email: string;
  declare password: string;
  declare role: 'admin' | 'super_admin';
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Method to check if password is valid
  public async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  // Class method for model initialization
  public static initialize(sequelize: Sequelize): typeof Admin {
    return Admin.init(
      {        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        username: {
          type: DataTypes.STRING(128),
          allowNull: false,
          unique: true,
        },
        email: {
          type: DataTypes.STRING(128),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        password: {
          type: DataTypes.STRING(128),
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM('admin', 'super_admin'),
          allowNull: false,
          defaultValue: 'admin',
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
        tableName: 'admins',
        sequelize,
        hooks: {
          beforeCreate: async (admin: Admin) => {
            // Hash password before saving
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(admin.password, salt);
          },
          beforeUpdate: async (admin: Admin) => {
            if (admin.changed('password')) {
              const salt = await bcrypt.genSalt(10);
              admin.password = await bcrypt.hash(admin.password, salt);
            }
          },
        },
      }
    );
  }
}

export default Admin; 