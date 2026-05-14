'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { LogOut, Settings, ChevronRight, History, Shield, Ticket, Crown, Pencil } from 'lucide-react';
import { getFullImageUrl } from '@/lib/utils';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadUserProfile();
  }, [router]);

  const loadUserProfile = async () => {
    // Try to load from localStorage first for immediate UI
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Then fetch latest from API to ensure consistency
    try {
      const { fetchAPI } = await import('@/lib/api');
      const latestUser = await fetchAPI('/auth/me');
      setUser(latestUser);
      localStorage.setItem('user', JSON.stringify(latestUser));
    } catch (err) {
      console.error('Failed to sync profile:', err);
      if (!userData) {
        router.push('/login');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  const menuItems = [
    { label: 'การตั้งค่า', icon: Settings, href: '/settings' },
  ];

  return (
    <div className="min-h-[100dvh]">
      {/* Profile Header */}
      <div className="relative pt-[max(env(safe-area-inset-top),16px)] pb-6 px-4 overflow-hidden">
        {/* Background decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--brand)]/[0.06] via-[var(--brand)]/[0.02] to-transparent" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--brand)]/[0.04] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

        <div className="relative flex flex-col items-center pt-4 animate-fade-in-up">
          {/* Avatar */}
          <div className="relative mb-3">
            <div className="w-[80px] h-[80px] rounded-full p-[3px] bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] shadow-[0_4px_20px_rgba(218,25,132,0.25)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-white p-[2px]">
                <img 
                  src={getFullImageUrl(user.profile_picture_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name)}&background=DA1984&color=fff&size=160`} 
                  alt={user.display_name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <button 
              onClick={() => router.push('/profile/edit')}
              className="absolute -bottom-1 -right-1 p-2 bg-white text-[var(--brand)] rounded-full shadow-md border border-zinc-100 active:scale-90 transition-transform"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <h2 className="text-[18px] font-extrabold text-zinc-900 tracking-tight">{user.display_name}</h2>
          <p className="text-[12px] text-zinc-400 font-medium mt-0.5">{user.phone_number}</p>

          <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-[var(--brand)]/[0.08] text-[var(--brand)] text-[10px] font-bold rounded-full border border-[var(--brand)]/10">
            {user.role === 'admin' && <Crown className="w-3 h-3" />}
            {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิกทั่วไป'}
          </div>
        </div>
      </div>


      {/* Action Menu Card */}
      <div className="px-4 mb-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="bg-white rounded-2xl border border-zinc-100/60 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => item.href !== '#' && router.push(item.href)}
                className={`w-full flex items-center justify-between px-4 py-3.5 active:bg-zinc-50 transition-colors ${
                  index < menuItems.length - 1 ? 'border-b border-zinc-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-[var(--brand)]/[0.06] rounded-lg text-[var(--brand)]">
                    <Icon className="w-[16px] h-[16px]" />
                  </div>
                  <span className="font-semibold text-zinc-800 text-[13px]">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout Area */}
      <div className="px-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-zinc-50 text-zinc-400 font-bold text-[13px] rounded-xl border border-zinc-100 active:bg-zinc-100 active:scale-[0.98] transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-white rounded-t-[28px] w-full max-w-[480px] p-6 pb-[max(env(safe-area-inset-bottom),24px)] shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            {/* Handle bar */}
            <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto mb-6" />

            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-extrabold text-center text-zinc-900 mb-1">ยืนยันการออกจากระบบ</h3>
            <p className="text-zinc-500 text-center text-[13px] leading-relaxed mb-6">
              คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleLogout}
                className="w-full py-3.5 bg-zinc-900 text-white font-bold text-[14px] rounded-xl active:scale-[0.98] transition-transform"
              >
                ออกจากระบบ
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-3.5 bg-zinc-100 text-zinc-500 font-bold text-[14px] rounded-xl active:bg-zinc-200 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
