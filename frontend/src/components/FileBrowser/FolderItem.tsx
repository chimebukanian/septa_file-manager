"use client";

import { Folder as FolderIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Folder } from '@/hooks/useFiles';

interface FolderItemProps {
  folder: Folder;
  viewMode: 'grid' | 'list';
  isDropTarget: boolean;
  onNavigate: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export default function FolderItem({
  folder,
  viewMode,
  isDropTarget,
  onNavigate,
  onDelete,
  onDragOver,
  onDragLeave,
  onDrop
}: FolderItemProps) {
  return (
    <div
      className={`group relative flex ${
        viewMode === 'grid'
          ? 'flex-col items-center justify-center p-4 text-center aspect-square'
          : 'items-center p-3'
      } border ${
        isDropTarget
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-100'
      } rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all cursor-pointer`}
      onClick={() => onNavigate(folder.id, folder.name)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <FolderIcon
        className={`${
          viewMode === 'grid' ? 'w-12 h-12 mb-3' : 'w-6 h-6 mr-3'
        } text-blue-500 flex-shrink-0 fill-blue-50`}
      />
      <div className={`flex-1 min-w-0 ${viewMode === 'grid' ? 'w-full' : ''}`}>
        <p className="text-sm font-medium text-gray-900 truncate" title={folder.name}>
          {folder.name}
        </p>
        {viewMode === 'list' && (
          <p className="text-xs text-gray-500 mt-0.5">
            {format(new Date(folder.updatedAt), 'MMM d, yyyy')}
          </p>
        )}
      </div>

      {/* Actions */}
      <div
        className={`absolute ${
          viewMode === 'grid' ? 'top-2 right-2' : 'right-4'
        } opacity-0 group-hover:opacity-100 transition-opacity`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(folder.id, folder.name);
          }}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          title="Delete folder"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
