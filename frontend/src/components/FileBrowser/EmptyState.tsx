"use client";

import { Folder as FolderIcon } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
      <FolderIcon className="w-16 h-16 text-gray-300 mb-4" />
      <p className="text-lg font-medium text-gray-900">This folder is empty</p>
      <p className="text-sm mt-1">Upload files or create a folder to get started.</p>
    </div>
  );
}
