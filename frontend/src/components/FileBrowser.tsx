"use client";

import { useState } from 'react';
import { useFiles } from '@/hooks/useFiles';
import { ApiClient } from '@/lib/apiClient';
import FileUploader from './FileUploader';
import Toolbar from './FileBrowser/Toolbar';
import EmptyState from './FileBrowser/EmptyState';
import NewFolderInput from './FileBrowser/NewFolderInput';
import FolderItem from './FileBrowser/FolderItem';
import FileItem from './FileBrowser/FileItem';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PromptDialog from '@/components/ui/PromptDialog';
import { toast } from 'sonner';

interface Breadcrumb {
  id: string | null;
  name: string;
}

export default function FileBrowser() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ id: null, name: 'Home' }]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const { folders, files, loading, error, refetch, setFolders, setFiles } = useFiles(currentFolderId);

  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Modals state
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    type: 'folder' | 'file';
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: 'folder',
    id: '',
    name: ''
  });

  const [renamePrompt, setRenamePrompt] = useState<{
    isOpen: boolean;
    id: string;
    currentName: string;
  }>({
    isOpen: false,
    id: '',
    currentName: ''
  });

  const handleNavigate = (folderId: string | null, folderName: string) => {
    setCurrentFolderId(folderId);
    if (folderId === null) {
      setBreadcrumbs([{ id: null, name: 'Home' }]);
    } else {
      // Manage breadcrumb trail
      const index = breadcrumbs.findIndex(b => b.id === folderId);
      if (index !== -1) {
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
      } else {
        setBreadcrumbs([...breadcrumbs, { id: folderId, name: folderName }]);
      }
    }
  };

  const handleCreateFolder = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newFolderName.trim()) {
      try {
        const folder = await ApiClient.post('/folders', {
          name: newFolderName.trim(),
          parentId: currentFolderId
        });
        setFolders([...folders, folder]);
        setCreatingFolder(false);
        setNewFolderName('');
        toast.success('Folder created successfully');
      } catch (err) {
        toast.error('Failed to create folder');
      }
    } else if (e.key === 'Escape') {
      setCreatingFolder(false);
      setNewFolderName('');
    }
  };

  const handleDeleteFolder = (id: string, name: string) => {
    setConfirmDelete({
      isOpen: true,
      type: 'folder',
      id,
      name
    });
  };

  const handleConfirmDeleteFolder = async (id: string) => {
    try {
      await ApiClient.delete(`/folders/${id}`);
      setFolders(folders.filter(f => f.id !== id));
      toast.success('Folder deleted successfully');
    } catch (err) {
      toast.error('Failed to delete folder');
    } finally {
      setConfirmDelete(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleRenameFile = (id: string, currentName: string) => {
    setRenamePrompt({
      isOpen: true,
      id,
      currentName
    });
  };

  const handleConfirmRenameFile = async (newName: string) => {
    const { id } = renamePrompt;
    try {
      await ApiClient.patch(`/uploads/${id}`, { name: newName });
      setFiles(files.map(f => f.id === id ? { ...f, name: newName } : f));
      toast.success('File renamed successfully');
    } catch (err) {
      toast.error('Failed to rename file');
    } finally {
      setRenamePrompt(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleDeleteFile = (id: string, name: string) => {
    setConfirmDelete({
      isOpen: true,
      type: 'file',
      id,
      name
    });
  };

  const handleConfirmDeleteFile = async (id: string) => {
    try {
      await ApiClient.delete(`/uploads/${id}`);
      setFiles(files.filter(f => f.id !== id));
      toast.success('File deleted successfully');
    } catch (err) {
      toast.error('Failed to delete file');
    } finally {
      setConfirmDelete(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleMoveFile = async (fileId: string, targetFolderId: string) => {
    try {
      await ApiClient.patch(`/uploads/${fileId}`, { folderId: targetFolderId });
      setFiles(files.filter(f => f.id !== fileId));
      toast.success('File moved successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to move file');
    } finally {
      setDropTargetId(null);
    }
  };

  const handleShareFile = async (id: string) => {
    try {
      const shareToken = await ApiClient.post(`/share/file/${id}`, {});
      const url = `${window.location.origin}/s/${shareToken.token}`;

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }

      toast.success('Share link copied to clipboard!');
      setFiles(files.map(f => f.id === id ? { ...f, isShared: true } : f));
    } catch (err) {
      toast.error('Failed to generate share link');
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4 p-8">
        <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">{error}</div>
        <button onClick={refetch} className="text-blue-600 hover:underline">Try Again</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <Toolbar
        breadcrumbs={breadcrumbs}
        onNavigate={(id, name) => handleNavigate(id, name)}
        onNewFolder={() => setCreatingFolder(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content Area */}
      <div className="flex-1 p-6 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : null}

        {folders.length === 0 && files.length === 0 && !creatingFolder && !loading ? (
          <EmptyState />
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" : "flex flex-col gap-2"}>
            {/* Inline Folder Creation */}
            {creatingFolder && (
              <NewFolderInput
                viewMode={viewMode}
                value={newFolderName}
                onChange={setNewFolderName}
                onKeyDown={handleCreateFolder}
                onBlur={() => setCreatingFolder(false)}
              />
            )}

            {/* Folders List */}
            {folders.map(folder => (
              <FolderItem
                key={folder.id}
                folder={folder}
                viewMode={viewMode}
                isDropTarget={dropTargetId === folder.id}
                onNavigate={(id) => handleNavigate(id, folder.name)}
                onDelete={handleDeleteFolder}
                onDragOver={(e) => { e.preventDefault(); setDropTargetId(folder.id); }}
                onDragLeave={() => setDropTargetId(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  const fileId = e.dataTransfer.getData('fileId');
                  if (fileId) handleMoveFile(fileId, folder.id);
                }}
              />
            ))}

            {/* Files List */}
            {files.map(file => (
              <FileItem
                key={file.id}
                file={file}
                viewMode={viewMode}
                onDragStart={(e) => {
                  e.dataTransfer.setData('fileId', file.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onShare={handleShareFile}
                onDelete={handleDeleteFile}
                onRename={handleRenameFile}
              />
            ))}
          </div>
        )}

        {/* Upload Zone */}
        <FileUploader currentFolderId={currentFolderId} onUploadComplete={refetch} />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title={confirmDelete.type === 'folder' ? 'Delete Folder' : 'Delete File'}
        message={
          confirmDelete.type === 'folder'
            ? `Are you sure you want to delete the folder "${confirmDelete.name}" and all its contents?`
            : `Are you sure you want to delete the file "${confirmDelete.name}"?`
        }
        confirmText="Delete"
        isDanger={true}
        onConfirm={() =>
          confirmDelete.type === 'folder'
            ? handleConfirmDeleteFolder(confirmDelete.id)
            : handleConfirmDeleteFile(confirmDelete.id)
        }
        onCancel={() => setConfirmDelete(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Rename Prompt Modal */}
      <PromptDialog
        isOpen={renamePrompt.isOpen}
        title="Rename File"
        message="Enter a new name for this file:"
        initialValue={renamePrompt.currentName}
        onConfirm={handleConfirmRenameFile}
        onCancel={() => setRenamePrompt(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
