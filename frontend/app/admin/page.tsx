'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchAPI } from '@/lib/api';
import { Voucher } from '@/types';
import { Plus, LayoutDashboard, Ticket, Trash2, ArrowLeft, CheckCircle2, Pencil, Trash, X, ChevronRight, Camera, Upload } from 'lucide-react';
import { getFullImageUrl } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';

export default function AdminPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, voucherId: string | null}>({
    show: false,
    voucherId: null
  });
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });
  const [now, setNow] = useState(new Date().getTime());
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080';

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().getTime()), 60000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  };
  
  const getClaimEndText = (claimEndTime: string) => {
    const end = new Date(claimEndTime).getTime();
    const diff = end - now;

    if (diff > 0 && diff < 48 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return (
        <span className="text-[var(--brand)] font-bold">
          สิ้นสุดการแจกในอีก {days > 0 ? `${days} วัน ` : ''}{hours > 0 || days > 0 ? `${hours} ชม.` : `${mins} นาที`}
        </span>
      );
    } else if (diff <= 0) {
      return 'หมดเวลาแจกแล้ว';
    }
    return `สิ้นสุดแจก ${new Date(claimEndTime).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })} เวลา ${new Date(claimEndTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })} น.`;
  };

  const isAdminExpiringSoon = (claimEndTime: string) => {
    const end = new Date(claimEndTime).getTime();
    const diff = end - now;
    return diff > 0 && diff < 48 * 60 * 60 * 1000;
  };
  
  const toLocalISO = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const initialVoucherState = {
    title: '',
    description: '',
    shop_name: 'Muty Cosmetics',
    category: 'Skincare',
    discount_type: 'percent',
    discount_value: 20,
    total_quota: 50,
    claim_start_time: toLocalISO(new Date()),
    claim_end_time: toLocalISO(new Date(Date.now() + 7 * 86400000)),
    valid_until: toLocalISO(new Date(Date.now() + 30 * 86400000)),
    image_url: '',
    is_active: true
  };

  const [newVoucher, setNewVoucher] = useState(initialVoucherState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vData, sData] = await Promise.all([
        fetchAPI('/admin/vouchers'),
        fetchAPI('/admin/dashboard')
      ]);
      setVouchers(vData);
      setStats(sData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newVoucher,
        total_quota: isUnlimited ? -1 : newVoucher.total_quota,
        claim_start_time: new Date(newVoucher.claim_start_time).toISOString(),
        claim_end_time: new Date(newVoucher.claim_end_time).toISOString(),
        valid_until: new Date(newVoucher.valid_until).toISOString(),
      };

      if (isEditing && editingId) {
        await fetchAPI(`/admin/vouchers/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showToast('อัปเดตคูปองสำเร็จ!', 'success');
      } else {
        await fetchAPI('/admin/vouchers', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('สร้างคูปองใหม่สำเร็จ!', 'success');
      }
      closeModal();
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.voucherId) return;
    try {
      await fetchAPI(`/admin/vouchers/${deleteModal.voucherId}`, { method: 'DELETE' });
      setDeleteModal({ show: false, voucherId: null });
      loadData();
      showToast('ลบคูปองเรียบร้อยแล้ว', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const openModal = (voucher?: Voucher) => {
    if (voucher) {
      setIsEditing(true);
      setEditingId(voucher.id);
      setIsUnlimited(voucher.total_quota === -1);
      setNewVoucher({
        title: voucher.title,
        description: voucher.description,
        shop_name: voucher.shop_name,
        category: voucher.category,
        discount_type: voucher.discount_type,
        discount_value: voucher.discount_value,
        total_quota: voucher.total_quota === -1 ? 0 : voucher.total_quota,
        claim_start_time: toLocalISO(new Date(voucher.claim_start_time)),
        claim_end_time: toLocalISO(new Date(voucher.claim_end_time)),
        valid_until: toLocalISO(new Date(voucher.valid_until)),
        image_url: voucher.image_url,
        is_active: voucher.is_active
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setIsUnlimited(false);
      setNewVoucher(initialVoucherState);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setIsUnlimited(false);
    setNewVoucher(initialVoucherState);
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] max-w-[480px] mx-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-zinc-100/50">
        <div className="px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/home')}
                className="p-2 -ml-2 rounded-xl active:bg-zinc-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-600" />
              </button>
              <div>
                <h1 className="text-[16px] font-extrabold text-zinc-900 tracking-tight">ควบคุมระบบ</h1>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-[0.15em]">Admin Dashboard</p>
              </div>
            </div>
            <button 
              onClick={() => openModal()}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[var(--brand)] to-[var(--brand-dark)] text-white px-4 py-2.5 rounded-xl font-bold text-[13px] shadow-[0_4px_16px_rgba(218,25,132,0.3)] active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              เพิ่มคูปอง
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 animate-fade-in-up">
          <div className="bg-white rounded-2xl p-3 border border-zinc-100/60 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="w-9 h-9 bg-[var(--brand)]/[0.08] rounded-xl flex items-center justify-center mb-2">
              <LayoutDashboard className="w-4.5 h-4.5 text-[var(--brand)]" />
            </div>
            <p className="text-[20px] font-extrabold text-zinc-900 leading-none">{stats?.total_vouchers || 0}</p>
            <p className="text-[9px] text-zinc-400 font-bold mt-1 uppercase tracking-wider">แคมเปญ</p>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-zinc-100/60 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="w-9 h-9 bg-[var(--brand)]/[0.08] rounded-xl flex items-center justify-center mb-2">
              <Ticket className="w-4.5 h-4.5 text-[var(--brand)]" />
            </div>
            <p className="text-[20px] font-extrabold text-zinc-900 leading-none">{stats?.total_claims || 0}</p>
            <p className="text-[9px] text-zinc-400 font-bold mt-1 uppercase tracking-wider">เก็บแล้ว</p>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-zinc-100/60 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="w-9 h-9 bg-[var(--brand)]/[0.08] rounded-xl flex items-center justify-center mb-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-[var(--brand)]" />
            </div>
            <p className="text-[20px] font-extrabold text-zinc-900 leading-none">{stats?.total_redeems || 0}</p>
            <p className="text-[9px] text-zinc-400 font-bold mt-1 uppercase tracking-wider">ใช้งานแล้ว</p>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-[15px] font-extrabold text-zinc-900">รายการคูปอง</h2>
          <span className="text-[11px] text-zinc-400 font-semibold">{vouchers.length} รายการ</span>
        </div>

        {/* Voucher Cards */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-[88px] rounded-2xl skeleton" />)}
          </div>
        ) : vouchers.length > 0 ? (
          <div className="space-y-2.5 stagger">
            {vouchers.map((v) => (
              <div 
                key={v.id} 
                className="bg-white rounded-2xl border border-zinc-100/60 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden card-interactive"
              >
                <div className="flex items-center p-3 gap-3">
                  {/* Image */}
                  <div className="w-[56px] h-[56px] rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                    <img
                      src={getFullImageUrl(v.image_url) || 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=200'}
                      alt={v.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-zinc-900 text-[13px] line-clamp-1 leading-snug">{v.title}</h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold shrink-0 ${
                        v.is_active 
                          ? 'bg-[var(--brand)]/[0.08] text-[var(--brand)]' 
                          : 'bg-zinc-100 text-zinc-400'
                      }`}>
                        {v.is_active ? 'เปิดใช้' : 'ปิดใช้'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-zinc-500 font-medium">
                          เก็บแล้ว {v.total_quota === -1 ? `${v.claimed_count} / ∞` : `${v.claimed_count}/${v.total_quota}`}
                        </span>
                        <span className={`text-[9px] ${isAdminExpiringSoon(v.claim_end_time) ? 'text-[var(--brand)]' : 'text-zinc-400'}`}>
                           {getClaimEndText(v.claim_end_time)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openModal(v)}
                          className="p-1.5 rounded-lg text-[var(--brand)] active:bg-[var(--brand)]/[0.06] transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setDeleteModal({ show: true, voucherId: v.id })}
                          className="p-1.5 rounded-lg text-zinc-400 active:bg-red-50 active:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="font-bold text-zinc-900 text-[15px] mb-1">ยังไม่มีคูปอง</h3>
            <p className="text-zinc-400 text-[13px]">กดปุ่ม "เพิ่มคูปอง" เพื่อเริ่มสร้าง</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal (Full-screen bottom sheet) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-fade-in" onClick={closeModal}>
          <div 
            className="absolute inset-x-0 bottom-0 bg-white rounded-t-[28px] max-h-[92dvh] overflow-y-auto animate-slide-up max-w-[480px] mx-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="sticky top-0 bg-white rounded-t-[28px] z-10 pt-3 pb-2 px-5">
              <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-extrabold text-zinc-900">{isEditing ? 'แก้ไขคูปอง' : 'สร้างคูปองใหม่'}</h2>
                <button onClick={closeModal} className="p-2 -mr-2 rounded-xl active:bg-zinc-100 transition-colors">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-5 pb-[max(env(safe-area-inset-bottom),24px)] space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[12px] font-bold text-zinc-500 mb-1.5">ชื่อคูปอง</label>
                <input 
                  type="text" 
                  value={newVoucher.title}
                  onChange={(e) => setNewVoucher({...newVoucher, title: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)]/30 transition-all text-[14px]" 
                  placeholder="เช่น ส่วนลด 50% สำหรับชิ้นแรก"
                  required
                />
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-[12px] font-bold text-zinc-500 mb-1.5">รายละเอียด</label>
                <textarea 
                  value={newVoucher.description}
                  onChange={(e) => setNewVoucher({...newVoucher, description: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)]/30 transition-all text-[14px] h-20 resize-none" 
                  placeholder="ใส่รายละเอียดคูปองและเงื่อนไข..."
                  required
                />
              </div>

              {/* Image Upload + Category */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[12px] font-bold text-zinc-500 mb-1.5">รูปภาพคูปอง</label>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!file.type.startsWith('image/')) {
                        showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error');
                        return;
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        showToast('ขนาดรูปภาพต้องไม่เกิน 5MB', 'error');
                        return;
                      }
                      setUploading(true);
                      const formData = new FormData();
                      formData.append('image', file);
                      try {
                        const response = await fetch(`${API_BASE}/api/auth/upload`, {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                          body: formData
                        });
                        if (!response.ok) throw new Error('Failed to upload');
                        const data = await response.json();
                        setNewVoucher(prev => ({...prev, image_url: data.url}));
                        showToast('อัปโหลดรูปภาพสำเร็จ!', 'success');
                      } catch (err: any) {
                        showToast(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด', 'error');
                      } finally {
                        setUploading(false);
                      }
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-[120px] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[var(--brand)]/30 hover:bg-[var(--brand)]/[0.02] transition-all overflow-hidden relative"
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
                        <span className="text-[11px] text-zinc-400 font-medium">กำลังอัปโหลด...</span>
                      </div>
                    ) : newVoucher.image_url ? (
                      <>
                        <img 
                          src={getFullImageUrl(newVoucher.image_url)} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-zinc-400">
                        <Upload className="w-6 h-6" />
                        <span className="text-[11px] font-medium">แตะเพื่อเลือกรูปภาพ</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-zinc-500 mb-1.5">หมวดหมู่</label>
                  <select 
                    value={newVoucher.category}
                    onChange={(e) => setNewVoucher({...newVoucher, category: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)]/30 transition-all text-[14px]"
                  >
                    <option value="Skincare">ดูแลผิว</option>
                    <option value="Makeup">แต่งหน้า</option>
                    <option value="Fragrance">น้ำหอม</option>
                  </select>
                </div>
              </div>

              {/* Quota + Toggle Row */}
              <div>
                <label className="block text-[12px] font-bold text-zinc-500 mb-1.5">จำนวนคูปอง (โควต้า)</label>
                <div className="flex gap-3">
                  <input 
                    type="number" 
                    value={isUnlimited ? '' : newVoucher.total_quota || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                      setNewVoucher({...newVoucher, total_quota: val});
                    }}
                    disabled={isUnlimited}
                    className={`flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--brand)]/20 transition-all text-[14px] font-bold ${isUnlimited ? 'opacity-40' : ''}`} 
                    placeholder={isUnlimited ? "∞ ไม่จำกัด" : "ระบุจำนวน"}
                    required={!isUnlimited}
                  />
                  <button
                    type="button"
                    onClick={() => setIsUnlimited(!isUnlimited)}
                    className={`px-4 py-3 rounded-xl text-[12px] font-bold border transition-all shrink-0 ${
                      isUnlimited 
                        ? 'bg-[var(--brand)]/[0.08] text-[var(--brand)] border-[var(--brand)]/20' 
                        : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                    }`}
                  >
                    ∞ ไม่จำกัด
                  </button>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between bg-zinc-50 rounded-xl px-4 py-3 border border-zinc-200">
                <span className="text-[13px] font-bold text-zinc-700">สถานะการแจก</span>
                <div 
                  onClick={() => setNewVoucher({...newVoucher, is_active: !newVoucher.is_active})}
                  className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-all duration-300 ${newVoucher.is_active ? 'bg-[var(--brand)]' : 'bg-zinc-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${newVoucher.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Date Section */}
              <div className="border-t border-zinc-100 pt-4">
                <h3 className="text-[13px] font-extrabold text-zinc-900 mb-3">กำหนดเวลา</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">เริ่มแจก</label>
                    <input 
                      type="datetime-local" 
                      value={newVoucher.claim_start_time}
                      onChange={(e) => setNewVoucher({...newVoucher, claim_start_time: e.target.value})}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--brand)]/20 text-[13px]" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">สิ้นสุดการแจก</label>
                    <input 
                      type="datetime-local" 
                      value={newVoucher.claim_end_time}
                      onChange={(e) => setNewVoucher({...newVoucher, claim_end_time: e.target.value})}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--brand)]/20 text-[13px]" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">วันหมดอายุคูปอง</label>
                    <input 
                      type="datetime-local" 
                      value={newVoucher.valid_until}
                      onChange={(e) => setNewVoucher({...newVoucher, valid_until: e.target.value})}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--brand)]/20 text-[13px]" 
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-2">
                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-gradient-to-r from-[var(--brand)] to-[var(--brand-dark)] text-white font-bold text-[14px] rounded-xl shadow-[0_4px_16px_rgba(218,25,132,0.3)] active:scale-[0.98] transition-transform"
                >
                  {isEditing ? 'บันทึกการแก้ไข' : 'ยืนยันสร้างคูปอง'}
                </button>
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="w-full py-3.5 bg-zinc-100 text-zinc-500 font-bold text-[14px] rounded-xl active:bg-zinc-200 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Bottom Sheet */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteModal({ show: false, voucherId: null })}>
          <div className="bg-white rounded-t-[28px] w-full max-w-[480px] p-6 pb-[max(env(safe-area-inset-bottom),24px)] shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto mb-6" />

            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-extrabold text-center text-zinc-900 mb-1">ยืนยันการลบคูปอง</h3>
            <p className="text-zinc-500 text-center text-[13px] leading-relaxed mb-6">
              คุณแน่ใจหรือไม่ว่าต้องการลบคูปองนี้? <br/>
              <span className="text-red-500 font-bold text-[11px]">การลบจะไม่สามารถกู้คืนได้</span>
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleDelete}
                className="w-full py-3.5 bg-red-500 text-white font-bold text-[14px] rounded-xl active:scale-[0.98] transition-transform"
              >
                ยืนยันการลบ
              </button>
              <button
                onClick={() => setDeleteModal({ show: false, voucherId: null })}
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
