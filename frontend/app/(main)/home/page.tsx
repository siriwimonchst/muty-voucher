'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { Voucher } from '@/types';
import VoucherCard from '@/components/VoucherCard';
import { Search, Plus, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';

export default function HomePage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [dragStart, setDragStart] = useState(0);
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });
  const router = useRouter();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  };

  const banners = [
    "/assets/banner_muty4.jpg",
    "/assets/banner_muty5.jpg"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
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
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    } else if (diff < -50) {
      setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  useEffect(() => {
    loadVouchers();
    loadUserProfile();
    loadClaimedVouchers();
  }, []);

  const loadClaimedVouchers = async () => {
    try {
      const data = await fetchAPI('/my-vouchers');
      // Extract voucher IDs from user vouchers
      const ids = data.map((uv: any) => uv.voucher_id);
      setClaimedIds(ids);
    } catch (err) {
      console.error('Failed to load claimed vouchers:', err);
    }
  };

  const loadUserProfile = async () => {
    try {
      const userData = await fetchAPI('/auth/me');
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      // Fallback to local storage if API fails
      const localUser = localStorage.getItem('user');
      if (localUser) setUser(JSON.parse(localUser));
    }
  };


  const loadVouchers = async (searchQuery = '') => {
    try {
      const data = await fetchAPI(`/vouchers?search=${searchQuery}`);
      setVouchers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadVouchers(search);
  };

  const handleClaim = async (id: string) => {
    try {
      await fetchAPI(`/vouchers/${id}/claim`, { method: 'POST' });
      setClaimedIds([...claimedIds, id]);
      // Reload to update counts
      loadVouchers(search);
      showToast('เก็บคูปองสำเร็จ! ไปดูที่หน้า คูปองของฉัน', 'success');
    } catch (err: any) {
      const errorMap: { [key: string]: string } = {
        'Voucher already claimed': 'คุณเก็บคูปองนี้ไปแล้ว',
        'Voucher quota exceeded': 'คูปองนี้ถูกเก็บจนครบโควตาแล้ว',
        'Voucher expired': 'คูปองนี้หมดอายุแล้ว',
        'Failed to claim voucher': 'เกิดข้อผิดพลาดในการเก็บคูปอง'
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
            {banners.map((banner, index) => (
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
            {banners.map((_, i) => (
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
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), loadVouchers(search))}
              className="w-full bg-transparent outline-none text-zinc-900 text-[14px] placeholder:text-zinc-400 font-medium"
            />
          </div>
        </div>

        {/* Section Header */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900 tracking-tight leading-tight">คูปองทั้งหมด</h2>
            </div>
            {/* Removed New badge */}
          </div>
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
            {vouchers.map((v) => (
              <VoucherCard
                key={v.id}
                voucher={v}
                onClaim={handleClaim}
                isClaimed={claimedIds.includes(v.id)}
                isAdmin={user?.role === 'admin'}
              />
            ))}
          </div>
        )}
      </div>

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
