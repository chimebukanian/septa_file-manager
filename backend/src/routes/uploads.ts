import { Router } from 'express';
import { initUpload, completeUpload, deleteFile, updateFile } from '../controllers/upload.controller';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
router.use(authenticateToken);

router.post('/init', initUpload);
router.post('/:id/complete', completeUpload);
router.delete('/:id', deleteFile);
router.patch('/:id', updateFile);

export default router;
