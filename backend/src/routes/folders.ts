import { Router, type Response } from 'express';
import { Folder, File } from '../models';
import { authenticateToken, type AuthRequest } from '../middlewares/authMiddleware';
import { recursiveSoftDeleteFolder } from '../services/folderService';

const router = Router();
router.use(authenticateToken);

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, parentId } = req.body;
    const userId = req.user!.id;

    if (!name) {
      res.status(400).json({ error: 'Folder name is required' });
      return;
    }

    if (parentId) {
      const parent = await Folder.findOne({ where: { id: parentId, userId } });
      if (!parent) {
        res.status(404).json({ error: 'Parent folder not found' });
        return;
      }
    }

    const folder = await Folder.create({ name, userId, parentId: parentId || null });
    res.status(201).json(folder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const folders = await Folder.findAll({ where: { userId, parentId: null } });
    const files = await File.findAll({ where: { userId, folderId: null, status: 'READY' } });

    res.status(200).json({ folders, files });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const folder = await Folder.findOne({ where: { id, userId } });
    if (!folder) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }

    const folders = await Folder.findAll({ where: { parentId: id, userId } });
    const files = await File.findAll({ where: { folderId: id, userId, status: 'READY' } });

    res.status(200).json({ folder, folders, files });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const folder = await Folder.findOne({ where: { id, userId } });
    if (!folder) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }

    await recursiveSoftDeleteFolder(id, userId);

    res.status(200).json({ message: 'Folder deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { name } = req.body;

    const folder = await Folder.findOne({ where: { id, userId } });
    if (!folder) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }

    if (name) {
      folder.name = name;
      await folder.save();
    }

    res.status(200).json(folder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
