import { Router } from 'express';
import { getSharedFile, createShareToken } from '../controllers/share.controller';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();


router.get('/:token', getSharedFile);


router.post('/file/:id', authenticateToken, createShareToken);

export default router;
