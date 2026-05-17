import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class ShareToken extends Model {
  public token!: string;
  public fileId!: string;
  public expiresAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
