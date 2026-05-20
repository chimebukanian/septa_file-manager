import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '@/lib/apiClient';

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  updatedAt: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  folderId: string | null;
  updatedAt: string;
  status: string;
  isShared: boolean;
}

export function useFiles(currentFolderId: string | null) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = currentFolderId ? `/folders/${currentFolderId}` : '/folders';
      const data = await ApiClient.get(endpoint);

      setFolders(data.folders || []);
      setFiles(data.files || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load contents');
    } finally {
      setLoading(false);
    }
  }, [currentFolderId]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  return { folders, files, loading, error, refetch: fetchContents, setFolders, setFiles };
}
