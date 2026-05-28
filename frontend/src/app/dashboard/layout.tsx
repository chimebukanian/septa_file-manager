"use client";

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { LogOut, FolderHeart } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <FolderHeart className="h-8 w-8 text-blue-600" />
                  <span className="text-xl font-bold text-gray-900 tracking-tight">Septa CloudVault</span>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
