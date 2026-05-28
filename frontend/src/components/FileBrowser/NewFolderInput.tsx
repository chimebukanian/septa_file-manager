"use client";

import { Folder as FolderIcon } from 'lucide-react';

interface NewFolderInputProps {
  viewMode: 'grid' | 'list';
  value: string;
  onChange: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
}

export default function NewFolderInput({
  viewMode,
  value,
  onChange,
  onKeyDown,
  onBlur
}: NewFolderInputProps) {
  return (
    <div className={`group relative flex ${viewMode === 'grid' ? 'flex-col items-center justify-center p-4 text-center aspect-square' : 'items-center p-3'} border-2 border-blue-400 border-dashed rounded-xl bg-blue-50/50`}>
      <FolderIcon className={`${viewMode === 'grid' ? 'w-12 h-12 mb-3' : 'w-6 h-6 mr-3'} text-blue-400`} />
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        className={`w-full bg-transparent outline-none text-sm font-medium text-gray-900 ${viewMode === 'grid' ? 'text-center' : ''}`}
        placeholder="Folder name..."
      />
    </div>
  );
}
