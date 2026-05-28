"use client";

import { useState, useRef, useCallback } from 'react';
import { UploadCloud, X, CheckCircle, AlertCircle } from 'lucide-react';
import { ApiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

const BLOCKED_EXTENSIONS = [
  '.py', '.java', '.sql', '.js', '.ts', '.jsx', '.tsx', '.c', '.cpp', '.h', '.cs', '.go', '.rs', '.rb', '.php', '.sh', '.bat', '.cmd', '.ps1', '.pl', '.swift', '.kt'
];

const isBlockedFile = (filename: string): boolean => {
  const parts = filename.split('.');
  if (parts.length <= 1) return false; // No extension
  const extension = '.' + parts.pop()?.toLowerCase();
  return BLOCKED_EXTENSIONS.includes(extension);
};

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

interface FileUploaderProps {
  currentFolderId: string | null;
  onUploadComplete: () => void;
}

export default function FileUploader({ currentFolderId, onUploadComplete }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; 
      }
    }
  };

  const processFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const blockedFiles: File[] = [];

    files.forEach(file => {
      if (isBlockedFile(file.name)) {
        blockedFiles.push(file);
      } else {
        validFiles.push(file);
      }
    });

    if (blockedFiles.length > 0) {
      toast.error(`Blocked upload of programming files: ${blockedFiles.map(f => f.name).join(', ')}`);
    }

    if (validFiles.length === 0) return;

    const newUploads = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploads(prev => [...newUploads, ...prev]);

    newUploads.forEach(upload => {
      uploadFile(upload);
    });
  };

  const uploadFile = async (upload: UploadingFile) => {
    if (upload.file.size > 10 * 1024 * 1024) {
      updateUploadStatus(upload.id, 'error', 'File exceeds 10MB limit');
      return;
    }

    try {
      //  Init upload
      const initRes = await ApiClient.post('/uploads/init', {
        filename: upload.file.name,
        size: upload.file.size,
        folderId: currentFolderId,
        contentType: upload.file.type
      });

      const { uploadId, presignedUrl } = initRes;

      // Upload to S3 using XHR for progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploads(prev => prev.map(u => u.id === upload.id ? { ...u, progress } : u));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error('Storage upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));

        xhr.open('PUT', presignedUrl, true);
        xhr.setRequestHeader('Content-Type', upload.file.type || 'application/octet-stream');
        xhr.send(upload.file);
      });

      // Complete upload
      await ApiClient.post(`/uploads/${uploadId}/complete`, {});

      updateUploadStatus(upload.id, 'success');
      onUploadComplete();
      
    } catch (err: any) {
      updateUploadStatus(upload.id, 'error', err.message || 'Upload failed');
    }
  };

  const updateUploadStatus = (id: string, status: 'success' | 'error', errorMessage?: string) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, status, errorMessage } : u));
  };

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div 
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          multiple 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        <UploadCloud className={`w-12 h-12 mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="text-sm font-medium text-gray-700">
          Click or drag files to this area to upload
        </p>
        <p className="text-xs text-gray-500 mt-1">Maximum file size 10MB</p>
      </div>

      {uploads.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100 max-h-64 overflow-y-auto">
          {uploads.map(upload => (
            <div key={upload.id} className="p-3 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate pr-4">{upload.file.name}</span>
                  {upload.status === 'uploading' && <span className="text-xs text-gray-500">{upload.progress}%</span>}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${upload.status === 'error' ? 'bg-red-500' : upload.status === 'success' ? 'bg-green-500' : 'bg-blue-600 transition-all duration-300'}`} 
                    style={{ width: `${upload.status === 'error' ? 100 : upload.progress}%` }}
                  ></div>
                </div>
                {upload.status === 'error' && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {upload.errorMessage}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                {upload.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {upload.status !== 'uploading' && (
                  <button onClick={(e) => { e.stopPropagation(); removeUpload(upload.id); }} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
