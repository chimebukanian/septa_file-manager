"use client";

import { File as FileIcon, Share2, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { FileItem as FileType } from '@/hooks/useFiles';

interface FileItemProps {
  file: FileType;
  viewMode: 'grid' | 'list';
  onDragStart: (e: React.DragEvent) => void;
  onShare: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onRename: (id: string, currentName: string) => void;
}

export default function FileItem({
  file,
  viewMode,
  onDragStart,
  onShare,
  onDelete,
  onRename
}: FileItemProps) {
  return (
    <div
      className={`group relative flex ${
        viewMode === 'grid'
          ? 'flex-col items-center justify-center p-4 text-center aspect-square'
          : 'items-center p-3'
      } border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all cursor-grab active:cursor-grabbing`}
      draggable
      onDragStart={onDragStart}
    >
      <FileIcon
        className={`${
          viewMode === 'grid' ? 'w-12 h-12 mb-3' : 'w-6 h-6 mr-3'
        } text-gray-400 flex-shrink-0`}
      />
      <div className={`flex-1 min-w-0 ${viewMode === 'grid' ? 'w-full' : ''}`}>
        <div className="flex items-center gap-1 justify-center sm:justify-start">
          <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
            {file.name}
          </p>

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
      <div
        className={`absolute ${
          viewMode === 'grid'
            ? 'top-2 right-2 flex flex-col gap-1'
            : 'right-4 flex items-center gap-2'
        } opacity-0 group-hover:opacity-100 transition-opacity`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRename(file.id, file.name);
          }}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors bg-white shadow-sm animate-fade-in"
          title="Rename file"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare(file.id);
          }}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors bg-white shadow-sm"
          title="Share file"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(file.id, file.name);
          }}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors bg-white shadow-sm"
          title="Delete file"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
