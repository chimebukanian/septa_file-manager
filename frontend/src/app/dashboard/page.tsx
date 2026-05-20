import FileBrowser from '@/components/FileBrowser';

export default function DashboardPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
      <FileBrowser />
    </div>
  );
}
