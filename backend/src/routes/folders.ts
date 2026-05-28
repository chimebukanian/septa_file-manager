import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import {
  createFolder,
  getFolders,
  getFolderById,
  deleteFolder,
  renameFolder
} from '../controllers/folder.controller';

const router = Router();
router.use(authenticateToken);

router.post('/', createFolder);
router.get('/', getFolders);
router.get('/:id', getFolderById);
router.delete('/:id', deleteFolder);
router.patch('/:id', renameFolder);

export default router;
