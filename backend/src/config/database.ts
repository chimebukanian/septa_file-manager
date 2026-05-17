import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'filemanager',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'filemanager_db',
  logging: false, // Set to console.log to see SQL queries
});

export default sequelize;
