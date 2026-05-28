"use client";
import { FolderPlus, LayoutGrid, List } from 'lucide-react';

interface Breadcrumb {
  id: string | null;
  name: string;
}

interface ToolbarProps {
  breadcrumbs: Breadcrumb[];
  onNavigate: (id: string | null, name: string) => void;
  onNewFolder: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export default function Toolbar({ breadcrumbs, onNavigate, onNewFolder, viewMode, onViewModeChange }: ToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.id || 'root'} className="flex items-center">
            <button onClick={() => onNavigate(crumb.id, crumb.name)} className="hover:text-blue-600 transition-colors">
              {crumb.name}
            </button>
            {index < breadcrumbs.length - 1 && <span className="mx-2 text-gray-400">/</span>}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onNewFolder}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <FolderPlus className="w-4 h-4" />
          <span className="hidden sm:inline">New Folder</span>
        </button>
        <div className="h-6 w-px bg-gray-200"></div>
        <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
