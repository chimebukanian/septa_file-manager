import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generatePresignedUrl, verifyFileExists } from '../services/s3Service';
import { Folder, File } from '../models';
import { AuthRequest } from '../middlewares/authMiddleware';

export const initUpload = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { filename, size, folderId, contentType } = req.body;

        if (!filename || !size) {
            return res.status(400).json({ error: 'Filename and size are required' });
        }

        
        const BLOCKED_EXTENSIONS = [
            '.py', '.java', '.sql', '.js', '.ts', '.jsx', '.tsx', '.c', '.cpp', '.h', '.cs', '.go', '.rs', '.rb', '.php', '.sh', '.bat', '.cmd', '.ps1', '.pl', '.swift', '.kt'
        ];
        const parts = filename.split('.');
        const extension = parts.length > 1 ? '.' + parts.pop()?.toLowerCase() : '';
        if (BLOCKED_EXTENSIONS.includes(extension)) {
            return res.status(400).json({ error: 'Uploading programming language source files (.py, .java, .sql, etc.) is not allowed' });
        }

        if (size > 10 * 1024 * 1024) {
            return res.status(400).json({ error: 'File exceeds 10MB limit' });
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
};

export const completeUpload = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;

        const file = await File.findOne({ where: { id, userId } });
        if (!file) return res.status(404).json({ error: 'File not found' });

        if (file.status === 'READY') return res.status(400).json({ error: 'File is already ready' });

        const exists = await verifyFileExists(file.storageKey);
        if (!exists) return res.status(400).json({ error: 'File not found in storage' });

        file.status = 'READY';
        await file.save();
        res.status(200).json(file);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteFile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;
        const file = await File.findOne({ where: { id, userId } });
        if (!file) return res.status(404).json({ error: 'File not found' });

        await file.destroy();
        res.status(200).json({ message: 'File deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateFile = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { folderId, name, isShared } = req.body;
        const userId = req.user!.id;

        const file = await File.findOne({ where: { id, userId } });
        if (!file) return res.status(404).json({ error: 'File not found' });

        // Validate target folder ownership if moving
        if (folderId !== undefined && folderId !== null) {
            const folder = await Folder.findOne({ where: { id: folderId, userId } });
            if (!folder) {
                return res.status(404).json({ error: 'Target folder not found' });
            }
        }

        const updateData: any = {};
        if (folderId !== undefined) updateData.folderId = folderId;
        if (name !== undefined) updateData.name = name;
        if (isShared !== undefined) updateData.isShared = isShared;

        await file.update(updateData);
        res.status(200).json(file);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};