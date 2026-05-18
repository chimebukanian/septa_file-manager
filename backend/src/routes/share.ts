import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { File, ShareToken } from '../models';
import { authenticateToken, type AuthRequest } from '../middlewares/authMiddleware';
import { generateDownloadUrl } from '../services/s3Service';

const router = Router();

// Public endpoint to access a shared file
router.get('/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const shareToken = await ShareToken.findOne({
      where: { token },
      include: [{ model: File, as: 'file' }],
    });

    if (!shareToken) {
      res.status(404).json({ error: 'Invalid or expired share link' });
      return;
    }

    if (new Date() > shareToken.expiresAt) {
      await shareToken.destroy(); // Cleanup expired token
      res.status(404).json({ error: 'Share link has expired' });
      return;
    }

    const file = (shareToken as any).file;
    if (!file || file.status !== 'READY') {
      res.status(404).json({ error: 'File is not available' });
      return;
    }

    const downloadUrl = await generateDownloadUrl(file.storageKey);
    res.status(200).json({ downloadUrl, file: { name: file.name, size: file.size } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected endpoint to create a share token
router.post('/file/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const file = await File.findOne({ where: { id, userId } });
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const token = uuidv4().replace(/-/g, '').substring(0, 16);
    
    // Set expiry to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const shareToken = await ShareToken.create({
      token,
      fileId: file.id,
      expiresAt,
    });

    
    if (!file.isShared) {
      await file.update({ isShared: true });
    }

    res.status(201).json(shareToken);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
