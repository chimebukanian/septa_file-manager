import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database';
import './models'; // Import models to initialize associations

import authRoutes from './routes/auth';
import folderRoutes from './routes/folders';
import uploadRoutes from './routes/uploads';
import shareRoutes from './routes/share';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/folders', folderRoutes);
app.use('/uploads', uploadRoutes);
app.use('/share', shareRoutes);

// Simple health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    // In production, use migrations instead of sync
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
