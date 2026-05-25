"use client";

import { useState, useCallback } from 'react';
import { useFiles, Folder, FileItem } from '@/hooks/useFiles';
import { Folder as FolderIcon, File as FileIcon, MoreVertical, LayoutGrid, List, UploadCloud, FolderPlus, Trash2, Share2, Download, Edit2 } from 'lucide-react';
import { ApiClient } from '@/lib/apiClient';
import { format } from 'date-fns';
import FileUploader from './FileUploader';
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

  const handleNavigate = (folderId: string | null, folderName: string) => {
    setCurrentFolderId(folderId);
    if (folderId === null) {
      setBreadcrumbs([{ id: null, name: 'Home' }]);
    } else {
      // Very basic breadcrumb management (doesn't handle deep direct links well without API support)
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
      } catch (err) {
        toast.error('Failed to create folder');
      }
    } else if (e.key === 'Escape') {
      setCreatingFolder(false);
      setNewFolderName('');
    }
  };

  const handleDeleteFolder = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the folder "${name}" and all its contents?`)) {
      try {
        await ApiClient.delete(`/folders/${id}`);
        setFolders(folders.filter(f => f.id !== id));
      } catch (err) {
        toast.error('Failed to delete folder');
      }
    }
  };

  const handleRenameFile = async (id: string, currentName: string) => {
    const newName = prompt('Enter new filename:', currentName);
    if (newName && newName !== currentName) {
      try {
        await ApiClient.patch(`/uploads/${id}`, { name: newName });
        setFiles(files.map(f => f.id === id ? { ...f, name: newName } : f));
      } catch (err) {
        toast.error('Failed to rename file');
      }
    }
  };

  const handleDeleteFile = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the file "${name}"?`)) {
      try {
        await ApiClient.delete(`/uploads/${id}`);
        setFiles(files.filter(f => f.id !== id));
      } catch (err) {
        toast.error('Failed to delete file');
      }
    }
  };

  const handleMoveFile = async (fileId: string, targetFolderId: string) => {
    try {
      await ApiClient.patch(`/uploads/${fileId}`, { folderId: targetFolderId });

      setFiles(files.filter(f => f.id !== fileId));
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
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id || 'root'} className="flex items-center">
              <button
                onClick={() => handleNavigate(crumb.id, crumb.name)}
                className="hover:text-blue-600 transition-colors"
              >
                {crumb.name}
              </button>
              {index < breadcrumbs.length - 1 && <span className="mx-2 text-gray-400">/</span>}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreatingFolder(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">New Folder</span>
          </button>
          <div className="h-6 w-px bg-gray-200"></div>
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : null}

        {folders.length === 0 && files.length === 0 && !creatingFolder && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
            <FolderIcon className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">This folder is empty</p>
            <p className="text-sm mt-1">Upload files or create a folder to get started.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" : "flex flex-col gap-2"}>

            {/* Inline Folder Creation */}
            {creatingFolder && (
              <div className={`group relative flex ${viewMode === 'grid' ? 'flex-col items-center justify-center p-4 text-center aspect-square' : 'items-center p-3'} border-2 border-blue-400 border-dashed rounded-xl bg-blue-50/50`}>
                <FolderIcon className={`${viewMode === 'grid' ? 'w-12 h-12 mb-3' : 'w-6 h-6 mr-3'} text-blue-400`} />
                <input
                  type="text"
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={handleCreateFolder}
                  onBlur={() => setCreatingFolder(false)}
                  className={`w-full bg-transparent outline-none text-sm font-medium text-gray-900 ${viewMode === 'grid' ? 'text-center' : ''}`}
                  placeholder="Folder name..."
                />
              </div>
            )}

            {folders.map(folder => (
              <div
                key={folder.id}
                className={`group relative flex ${viewMode === 'grid' ? 'flex-col items-center justify-center p-4 text-center aspect-square' : 'items-center p-3'} border ${dropTargetId === folder.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-100'} rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all cursor-pointer`}
                onClick={() => handleNavigate(folder.id, folder.name)}
                onDragOver={(e) => { e.preventDefault(); setDropTargetId(folder.id); }}
                onDragLeave={() => setDropTargetId(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  const fileId = e.dataTransfer.getData('fileId');
                  if (fileId) handleMoveFile(fileId, folder.id);
                }}
              >
                <FolderIcon className={`${viewMode === 'grid' ? 'w-12 h-12 mb-3' : 'w-6 h-6 mr-3'} text-blue-500 flex-shrink-0 fill-blue-50`} />
                <div className={`flex-1 min-w-0 ${viewMode === 'grid' ? 'w-full' : ''}`}>
                  <p className="text-sm font-medium text-gray-900 truncate">{folder.name}</p>
                  {viewMode === 'list' && <p className="text-xs text-gray-500 mt-0.5">{format(new Date(folder.updatedAt), 'MMM d, yyyy')}</p>}
                </div>

                {/* Actions */}
                <div className={`absolute ${viewMode === 'grid' ? 'top-2 right-2' : 'right-4'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id, folder.name); }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete folder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {files.map(file => (
              <div
                key={file.id}
                className={`group relative flex ${viewMode === 'grid' ? 'flex-col items-center justify-center p-4 text-center aspect-square' : 'items-center p-3'} border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all cursor-grab active:cursor-grabbing`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('fileId', file.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
              >
                <FileIcon className={`${viewMode === 'grid' ? 'w-12 h-12 mb-3' : 'w-6 h-6 mr-3'} text-gray-400 flex-shrink-0`} />
                <div className={`flex-1 min-w-0 ${viewMode === 'grid' ? 'w-full' : ''}`}>
                  <div className="flex items-center gap-1 justify-center sm:justify-start">
                    <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>{file.name}</p>
                    {/* Simple indicator if shared - assuming your API returns a flag or tokens */}
                    {file.isShared && (
                      <span title="Shared">
                        <Share2 className="w-3 h-3 text-blue-500" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {viewMode === 'list' ? `${(file.size / 1024 / 1024).toFixed(2)} MB • ` : ''}
                    {format(new Date(file.updatedAt), 'MMM d, yyyy')}
                  </p>
                </div>

                {/* Actions */}
                <div className={`absolute ${viewMode === 'grid' ? 'top-2 right-2 flex flex-col gap-1' : 'right-4 flex items-center gap-2'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShareFile(file.id); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors bg-white shadow-sm"
                    title="Share file"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id, file.name); }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors bg-white shadow-sm"
                    title="Delete file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Zone */}
        <FileUploader currentFolderId={currentFolderId} onUploadComplete={refetch} />
      </div>
    </div>
  );
}
