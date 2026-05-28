import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import './models'; 

import authRoutes from './routes/auth.js';
import folderRoutes from './routes/folders.js';
import uploadRoutes from './routes/uploads.js';
import shareRoutes from './routes/share.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

app.use('/auth', authRoutes);
app.use('/folders', folderRoutes);
app.use('/uploads', uploadRoutes);
app.use('/share', shareRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    
    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

startServer();
