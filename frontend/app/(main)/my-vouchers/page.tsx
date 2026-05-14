'use client';

import { useState, useEffect } from 'react';
import { Clock, Ticket, Scissors, CheckCircle2, AlertCircle, Search, X } from 'lucide-react';
import { fetchAPI } from '@/lib/api';
import { UserVoucher } from '@/types';
import Toast from '@/components/Toast';

export default function MyVouchersPage() {
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'AVAILABLE' | 'USED' | 'EXPIRED'>('AVAILABLE');
  const [search, setSearch] = useState('');

  const [confirmModal, setConfirmModal] = useState<{show: boolean, voucherId: string | null}>({
    show: false,
    voucherId: null
  });
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    loadMyVouchers();
  }, []);

  const loadMyVouchers = async () => {
    try {
      const data = await fetchAPI('/my-vouchers');
      setUserVouchers(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseVoucher = async () => {
    if (!confirmModal.voucherId) return;
    
    try {
      await fetchAPI(`/user-vouchers/${confirmModal.voucherId}/use`, { method: 'POST' });
      setConfirmModal({ show: false, voucherId: null });
      showToast('ใช้งานคูปองสำเร็จ!', 'success');
      await loadMyVouchers();
      setFilter('USED');
    } catch (err: any) {
      const errorMap: { [key: string]: string } = {
        'Voucher already used': 'คูปองนี้ถูกใช้งานไปแล้ว',
        'Voucher expired': 'คูปองนี้หมดอายุแล้ว',
        'User voucher not found': 'ไม่พบข้อมูลคูปองของคุณ',
        'Failed to use voucher': 'เกิดข้อผิดพลาดในการใช้งานคูปอง'
      };
      showToast(errorMap[err.message] || err.message, 'error');
    }
  };

  const filteredVouchers = userVouchers.filter(uv => {
    const matchesStatus = uv.status === filter;
    const matchesSearch = uv.voucher_details.title.toLowerCase().includes(search.toLowerCase()) || 
                          uv.voucher_details.shop_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const tabCounts = {
    AVAILABLE: userVouchers.filter(v => v.status === 'AVAILABLE').length,
    USED: userVouchers.filter(v => v.status === 'USED').length,
    EXPIRED: userVouchers.filter(v => v.status === 'EXPIRED').length,
  };

  return (
    <div className="min-h-[100dvh]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-zinc-100/50">
        <div className="px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3">
          <h1 className="text-lg font-extrabold text-zinc-900 tracking-tight">คูปองของฉัน</h1>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-[0.15em]">My Vouchers</p>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-3">
          <div className="flex p-1 bg-zinc-100/80 rounded-xl gap-1">
            {(['AVAILABLE', 'USED', 'EXPIRED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all duration-200 ${
                  filter === status 
                    ? 'bg-white text-[var(--brand)] shadow-sm' 
                    : 'text-zinc-500 active:bg-white/50'
                }`}
              >
                {status === 'AVAILABLE' ? 'พร้อมใช้' : status === 'USED' ? 'ใช้แล้ว' : 'หมดอายุ'}
                {tabCounts[status] > 0 && (
                  <span className={`ml-1 text-[10px] ${filter === status ? 'text-[var(--brand)]' : 'text-zinc-400'}`}>
                    {tabCounts[status]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาคูปองของคุณ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-100 rounded-xl focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)]/30 outline-none transition-all shadow-[0_1px_4px_rgba(0,0,0,0.04)] text-[13px]"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-[100px] rounded-2xl skeleton" />)}
          </div>
        ) : filteredVouchers.length > 0 ? (
          <div className="space-y-3 stagger">
            {filteredVouchers.map((uv) => (
              <div 
                key={uv.id} 
                className={`bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.05)] border border-zinc-100/60 overflow-hidden flex h-[100px] card-interactive w-full relative ${
                  uv.status !== 'AVAILABLE' ? 'grayscale opacity-60' : ''
                }`}
              >
                {/* Left: Image Section */}
                <div className="w-[88px] h-full relative overflow-hidden bg-zinc-100 shrink-0">
                  <img
                    src={uv.voucher_details.image_url || 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400'}
                    alt={uv.voucher_details.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Middle: Details Section */}
                <div className="flex-1 px-3 py-2.5 flex flex-col justify-between min-w-0 relative">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-zinc-900 text-[13px] line-clamp-1 leading-snug">
                      {uv.voucher_details.title}
                    </h3>
                    
                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                      {uv.voucher_details.description}
                    </p>
                  </div>

                  <div className="flex items-center text-[10px] text-zinc-400 gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="truncate">หมดอายุ {new Date(uv.voucher_details.valid_until).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                  </div>

                  {/* Dashed Separator */}
                  <div className="absolute -right-[1px] top-3 bottom-3 w-[1px] border-r-2 border-dashed border-zinc-200/80" />
                </div>

                {/* Right: Action Section */}
                <button
                  onClick={() => uv.status === 'AVAILABLE' && setConfirmModal({ show: true, voucherId: uv.id })}
                  disabled={uv.status !== 'AVAILABLE'}
                  className={`w-[58px] flex flex-col items-center justify-center gap-1 transition-all shrink-0 ${
                    uv.status === 'AVAILABLE'
                      ? 'bg-gradient-to-b from-[var(--brand)] to-[var(--brand-dark)] text-white active:scale-95 cursor-pointer'
                      : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  {uv.status === 'AVAILABLE' ? (
                    <>
                      <Ticket className="w-5 h-5" />
                      <span className="text-[10px] font-bold leading-none">ใช้</span>
                    </>
                  ) : uv.status === 'USED' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-[9px] font-bold leading-none">ใช้แล้ว</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-[9px] font-bold leading-none">หมดอายุ</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
              <Ticket className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="font-bold text-zinc-900 text-[15px] mb-1">ยังไม่มีคูปอง</h3>
            <p className="text-zinc-400 text-[13px] mb-6">คุณยังไม่มีคูปองที่ {filter === 'AVAILABLE' ? 'พร้อมใช้งาน' : filter === 'USED' ? 'ใช้แล้ว' : 'หมดอายุ'}</p>
            <button 
              onClick={() => window.location.href = '/home'}
              className="px-6 py-3 bg-gradient-to-r from-[var(--brand)] to-[var(--brand-dark)] text-white font-bold text-[13px] rounded-xl shadow-[0_4px_16px_rgba(218,25,132,0.3)] active:scale-95 transition-transform"
            >
              ไปเก็บคูปองกันเลย!
            </button>
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setConfirmModal({ show: false, voucherId: null })}>
          <div className="bg-white rounded-t-[28px] w-full max-w-[480px] p-6 pb-[max(env(safe-area-inset-bottom),24px)] shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            {/* Handle bar */}
            <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto mb-6" />

            <div className="w-16 h-16 bg-[var(--brand)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-[var(--brand)]" />
            </div>
            <h3 className="text-lg font-extrabold text-center text-zinc-900 mb-1">ยืนยันการใช้คูปอง</h3>
            <p className="text-zinc-500 text-center text-[13px] leading-relaxed mb-6">
              คุณแน่ใจหรือไม่ว่าต้องการใช้คูปองนี้? <br/>
              <span className="text-[var(--brand)] font-bold text-[11px]">เมื่อกดแล้วจะไม่สามารถยกเลิกได้</span>
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleUseVoucher}
                className="w-full py-3.5 bg-gradient-to-r from-[var(--brand)] to-[var(--brand-dark)] text-white font-bold text-[14px] rounded-xl shadow-[0_4px_16px_rgba(218,25,132,0.3)] active:scale-[0.98] transition-transform"
              >
                ยืนยันการใช้งาน
              </button>
              <button
                onClick={() => setConfirmModal({ show: false, voucherId: null })}
                className="w-full py-3.5 bg-zinc-100 text-zinc-500 font-bold text-[14px] rounded-xl active:bg-zinc-200 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
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
