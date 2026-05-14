'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, Lock, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();

  const settingsItems = [
    { label: 'เปลี่ยนรหัสผ่าน', icon: Lock, href: '/settings/change-password' },
  ];

  return (
    <div className="min-h-[100dvh]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-zinc-100/50">
        <div className="flex items-center px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 text-zinc-400 active:text-zinc-900 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="ml-2">
            <h1 className="text-lg font-extrabold text-zinc-900 tracking-tight">การตั้งค่า</h1>
          </div>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="px-4 py-6 animate-fade-in-up">
        <div className="bg-white rounded-2xl border border-zinc-100/60 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          {settingsItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => item.href !== '#' && router.push(item.href)}
                className={`w-full flex items-center justify-between px-4 py-4 active:bg-zinc-50 transition-colors ${
                  index < settingsItems.length - 1 ? 'border-b border-zinc-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-[var(--brand)]/[0.06] rounded-lg text-[var(--brand)]">
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  <span className="font-semibold text-zinc-800 text-[14px]">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
