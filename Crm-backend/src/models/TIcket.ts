import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface TicketAttributes {
  id?: number;
  userId: number;
  title: string;
  description: string;
  status?: string;
}

interface TicketCreationAttributes extends Optional<TicketAttributes, 'id' | 'status'> {}

class Ticket extends Model<TicketAttributes, TicketCreationAttributes> implements TicketAttributes {
  public id!: number;
  public userId!: number;
  public title!: string;
  public description!: string;
  public status!: string;
}

Ticket.init(
  {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'open' },
  },
  {
    sequelize,
    modelName: 'Ticket',
  }
);

export default Ticket;
