"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ApiClient } from '@/lib/apiClient';
import { FileDown, AlertCircle } from 'lucide-react';

interface SharedFile {
  name: string;
  size: number;
}

export default function SharedFilePage() {
  const { token } = useParams();
  const [file, setFile] = useState<SharedFile | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        const data = await ApiClient.get(`/share/${token}`);
        setFile(data.file);
        setDownloadUrl(data.downloadUrl);
      } catch (err: any) {
        setError(err.message || 'Failed to load shared file');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSharedFile();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !file || !downloadUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired or Invalid</h2>
          <p className="text-gray-500">The share link you followed is no longer active or does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
        <FileDown className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-1 truncate px-4" title={file.name}>
          {file.name}
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
        
        <a
          href={downloadUrl}
          download={file.name}
          className="inline-flex items-center justify-center w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
        >
          <FileDown className="w-5 h-5 mr-2" />
          Download File
        </a>
      </div>
    </div>
  );
}
