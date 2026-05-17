import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class ShareToken extends Model {
  declare token: string;
  declare fileId: string;
  declare expiresAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ShareToken.init(
  {
    token: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    fileId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ShareToken',
    tableName: 'share_tokens',
    timestamps: true,
  }
);

export default ShareToken;
