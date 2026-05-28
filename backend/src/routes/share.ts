import { Router } from 'express';
import { getSharedFile, createShareToken } from '../controllers/share.controller';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Public endpoint to access a shared file
router.get('/:token', getSharedFile);

// Protected endpoint to create a share token
router.post('/file/:id', authenticateToken, createShareToken);

export default router;
