import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Folder extends Model {
  declare id: string;
  declare name: string;
  declare userId: string;
  declare parentId: string | null;
  declare deletedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Folder.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Folder',
    tableName: 'folders',
    timestamps: true,
    paranoid: true, // Enables soft deletes via deletedAt
  }
);

export default Folder;
