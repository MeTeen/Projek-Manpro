import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

// Task attributes interface
interface TaskAttributes {
  id: number;
  date: Date;
  content: string;
  isCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Task creation attributes - all the required attributes when creating a new Task
interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'isCompleted' | 'createdAt' | 'updatedAt'> {}

// Task model class
class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public date!: Date;
  public content!: string;
  public isCompleted!: boolean;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static method to initialize the model with Sequelize instance
  static initialize(sequelize: Sequelize): void {
    Task.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        content: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        isCompleted: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'tasks',
        timestamps: true,
      }
    );
  }
}

export default Task; 