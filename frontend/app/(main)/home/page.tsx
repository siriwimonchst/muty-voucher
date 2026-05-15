'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { Voucher, UserVoucher } from '@/types';
import VoucherCard from '@/components/VoucherCard';
import VoucherDetailModal from '@/components/VoucherDetailModal';
import { Search, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';

const BANNERS = [
  "/assets/banner_muty4.jpg",
  "/assets/banner_muty5.jpg",
];

export default function HomePage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
  const [user, setUser] = useState<any>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [dragStart, setDragStart] = useState(0);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });
  const router = useRouter();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const posX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStart(posX);
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    const posX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStart - posX;

    if (diff > 50) {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    } else if (diff < -50) {
      setCurrentBanner((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
    }
  };

  useEffect(() => {
    loadUserProfile();
    loadClaimedVouchers();
  }, []);

  // Real-time search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadVouchers(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadClaimedVouchers = async () => {
    try {
      const data = await fetchAPI('/my-vouchers');
      setUserVouchers(data);
    } catch (err) {
      console.error('Failed to load claimed vouchers:', err);
    }
  };

  const loadUserProfile = async () => {
    try {
      const userData = await fetchAPI('/auth/me');
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch {
      const localUser = localStorage.getItem('user');
      if (localUser) setUser(JSON.parse(localUser));
    }
  };

  const loadVouchers = async (searchQuery = '') => {
    try {
      const data = await fetchAPI(`/vouchers?search=${searchQuery}`);
      setVouchers(data);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (id: string) => {
    try {
      await fetchAPI(`/vouchers/${id}/claim`, { method: 'POST' });
      await loadClaimedVouchers();
      loadVouchers(search);
      showToast('เก็บคูปองสำเร็จ! ไปดูที่หน้า คูปองของฉัน', 'success');
    } catch (err: any) {
      const errorMap: { [key: string]: string } = {
        'Voucher already claimed': 'คุณเก็บคูปองนี้ไปแล้ว',
        'Voucher quota exceeded': 'คูปองนี้ถูกเก็บจนครบโควตาแล้ว',
        'Voucher expired': 'คูปองนี้หมดอายุแล้ว',
        'Failed to claim voucher': 'เกิดข้อผิดพลาดในการเก็บคูปอง',
        'Voucher is not available or quota is full': 'คูปองนี้ถูกเก็บจนครบโควตาแล้ว หรือหมดเวลาแจก',
      };
      showToast(errorMap[err.message] || err.message, 'error');
    }
  };

  return (
    <div className="min-h-[100dvh] overflow-x-hidden">

      {/* Hero Banner Section */}
      <div className="relative animate-fade-in">
        <div
          className="relative overflow-hidden aspect-[16/9]"
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        >
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] h-full"
            style={{ transform: `translateX(-${currentBanner * 100}%)` }}
          >
            {BANNERS.map((banner, index) => (
              <div key={index} className="min-w-full h-full relative">
                <img
                  src={banner}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--background)] to-transparent" />

          {/* Pagination Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`h-[5px] rounded-full transition-all duration-400 ${
                  currentBanner === i
                    ? 'w-7 bg-[var(--brand)] shadow-[0_0_8px_rgba(218,25,132,0.5)]'
                    : 'w-[5px] bg-zinc-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 space-y-5 -mt-2">

        {/* Search Bar */}
        <div className="relative animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="relative flex items-center bg-white rounded-2xl px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-zinc-100/80 transition-all focus-within:shadow-[0_2px_20px_rgba(218,25,132,0.1)] focus-within:border-[var(--brand)]/20">
            <Search className="w-[18px] h-[18px] text-zinc-400 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="ค้นหาคูปอง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              className="w-full bg-transparent outline-none text-zinc-900 text-[14px] placeholder:text-zinc-400 font-medium pr-8"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  loadVouchers('');
                }}
                className="absolute right-4 p-1 rounded-full hover:bg-zinc-100 text-zinc-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Section Header */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg font-extrabold text-zinc-900 tracking-tight leading-tight">คูปองทั้งหมด</h2>
        </div>

        {/* Voucher List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[100px] rounded-2xl skeleton" />
            ))}
          </div>
        ) : (
          <div className="space-y-3 stagger">
            {vouchers.map((v) => {
              const userVoucher = userVouchers.find(uv => uv.voucher_id === v.id);
              return (
                <div key={v.id} onClick={() => setSelectedVoucher(v)}>
                  <VoucherCard
                    voucher={v}
                    onClaim={handleClaim}
                    isClaimed={!!userVoucher}
                    isAdmin={user?.role === 'admin'}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Voucher Detail Modal */}
      {selectedVoucher && (() => {
        const userVoucher = userVouchers.find(uv => uv.voucher_id === selectedVoucher.id);
        const isClaimed = !!userVoucher;

        return (
          <VoucherDetailModal
            voucher={selectedVoucher}
            isOpen={!!selectedVoucher}
            onClose={() => setSelectedVoucher(null)}
            actionText={isClaimed ? 'เก็บแล้ว' : 'เก็บคูปอง'}
            onAction={(id) => {
              if (!isClaimed) {
                handleClaim(id);
              }
            }}
            isActionDisabled={isClaimed}
            statusText={isClaimed ? 'เก็บแล้ว' : 'เก็บคูปอง'}
          />
        );
      })()}

      {/* Admin Floating Action Button */}
      {user?.role === 'admin' && (
        <div className="fixed bottom-[calc(var(--nav-height)+16px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-full max-w-[480px] pointer-events-none z-[90] px-5 flex justify-end">
          <button
            onClick={() => router.push('/admin')}
            className="w-14 h-14 bg-brand-gradient text-white rounded-2xl shadow-[0_4px_20px_rgba(218,25,132,0.4)] flex items-center justify-center active:scale-90 transition-all pointer-events-auto"
            title="จัดการคูปอง"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}
