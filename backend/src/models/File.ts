import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class File extends Model {
  declare id: string;
  declare name: string;
  declare size: number;
  declare userId: string;
  declare folderId: string | null;
  declare status: 'PENDING' | 'READY';
  declare storageKey: string;
  declare deletedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

File.init(
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
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    folderId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'READY'),
      defaultValue: 'PENDING',
    },
    storageKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'File',
    tableName: 'files',
    timestamps: true,
    paranoid: true, // Enables soft deletes
  }
);

export default File;
