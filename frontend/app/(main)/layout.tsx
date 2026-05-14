import BottomNav from '@/components/BottomNav';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 min-w-[320px]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand">
          Muty คูปอง
        </h1>
        {/* Removed Notification Bell */}
      </header>

      {/* Page Content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
