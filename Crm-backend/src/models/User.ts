// import { Model, DataTypes, Optional } from 'sequelize';
// import sequelize from '../config/db';

// interface UserAttributes {
//   id: number;
//   username: string;
//   password: string;
//   role: string;
// }

// interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role'> {}

// class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
//   public id!: number;
//   public username!: string;
//   public password!: string;
//   public role!: string;
// }

// User.init(
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     username: {
//       type: DataTypes.STRING,
//       unique: true,
//     },
//     password: {
//       type: DataTypes.STRING,
//     },
//     role: {
//       type: DataTypes.STRING,
//       defaultValue: 'customer',
//     },
//   },
//   { sequelize, modelName: 'User' }
// );

// export default User;

import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';

interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password?: string | null;
  role: 'admin' | 'super_admin' | 'customer';
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'password' | 'role'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string | null;
  public role!: 'admin' | 'super_admin' | 'customer';
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('admin', 'super_admin', 'customer'),
      allowNull: false,
      defaultValue: 'customer',
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
  }
);

export default User;
