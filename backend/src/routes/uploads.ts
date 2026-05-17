import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generatePresignedUrl, verifyFileExists } from '../services/s3Service';
import { Folder, File } from '../models';
import { authenticateToken, AuthRequest } from '../middlewares/authMiddleware';


const router = Router();
router.use(authenticateToken);

router.post('/init', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { filename, size, folderId, contentType } = req.body;

    if (!filename || !size) {
      res.status(400).json({ error: 'Filename and size are required' });
      return;
    }

    if (size > 10 * 1024 * 1024) {
      res.status(400).json({ error: 'File exceeds 10MB limit' });
      return;
    }

    const fileId = uuidv4();
    const storageKey = `uploads/${userId}/${fileId}-${filename}`;

    const presignedUrl = await generatePresignedUrl(storageKey, contentType || 'application/octet-stream');

    const file = await File.create({
      id: fileId,
      name: filename,
      size,
      userId,
      folderId: folderId || null,
      status: 'PENDING',
      storageKey,
    });

    res.status(200).json({ uploadId: file.id, presignedUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const file = await File.findOne({ where: { id, userId } });
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    if (file.status === 'READY') {
      res.status(400).json({ error: 'File is already ready' });
      return;
    }

    const exists = await verifyFileExists(file.storageKey);
    if (!exists) {
      res.status(400).json({ error: 'File not found in storage' });
      return;
    }

    file.status = 'READY';
    await file.save();

    res.status(200).json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const file = await File.findOne({ where: { id, userId } });
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    await file.destroy(); // Soft delete via paranoid
    res.status(200).json({ message: 'File deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { folderId, name } = req.body;
    const userId = req.user!.id;


    const file = await File.findOne({ where: { id, userId } });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // verify the target folder exists and belongs to the user
    if (folderId) {
      const folder = await Folder.findOne({ where: { id: folderId, userId } });
      if (!folder) {
        res.status(404).json({ error: 'Target folder not found' });
        return;
      }
    }

    if (folderId !== undefined) {
      file.folderId = folderId || null;
    }

    if (name) {
      file.name = name;
    }

    await file.save();

    res.status(200).json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
