'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { Voucher } from '@/types';
import { Plus, LayoutDashboard, Ticket, Trash2, ArrowLeft, CheckCircle2, Pencil, X, Search } from 'lucide-react';
import { getFullImageUrl } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';
import AdminVoucherForm, { VoucherFormData } from '@/components/admin/AdminVoucherForm';
import AdminDeleteModal from '@/components/admin/AdminDeleteModal';

// ── Helpers ──────────────────────────────────────────────────────────────────

const toLocalISO = (date: Date) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const makeInitialForm = (): VoucherFormData => ({
  title: '',
  description: '',
  shop_name: 'Muty Cosmetics',
  discount_type: 'percent',
  discount_value: 20,
  total_quota: 50,
  claim_start_time: toLocalISO(new Date()),
  claim_end_time: toLocalISO(new Date(Date.now() + 7 * 86400000)),
  valid_until: toLocalISO(new Date(Date.now() + 30 * 86400000)),
  image_url: '',
  is_active: true,
});

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [now, setNow] = useState(new Date().getTime());

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [formData, setFormData] = useState<VoucherFormData>(makeInitialForm());

  // Delete state
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; voucherId: string | null }>({
    show: false,
    voucherId: null,
  });

  // Toast
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false, message: '', type: 'success',
  });
  const showToast = (message: string, type: 'success' | 'error' = 'success') =>
    setToast({ show: true, message, type });

  const router = useRouter();

  // ── Tick clock ───────────────────────────────────────────────────────────

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().getTime()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ── Auth + initial load ───────────────────────────────────────────────────

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    loadData();
  }, []);

  // ── Data ──────────────────────────────────────────────────────────────────

  const loadData = async () => {
    try {
      const [vData, sData] = await Promise.all([
        fetchAPI('/admin/vouchers'),
        fetchAPI('/admin/dashboard'),
      ]);
      const sorted = [...vData].sort(
        (a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime(),
      );
      setVouchers(sorted);
      setStats(sData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVouchers = vouchers.filter(
    (v) =>
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.shop_name.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Form actions ──────────────────────────────────────────────────────────

  const openForm = (voucher?: Voucher) => {
    if (voucher) {
      setIsEditing(true);
      setEditingId(voucher.id);
      setIsUnlimited(voucher.total_quota === -1);
      setFormData({
        title: voucher.title,
        description: voucher.description,
        shop_name: voucher.shop_name,
        discount_type: voucher.discount_type,
        discount_value: voucher.discount_value,
        total_quota: voucher.total_quota === -1 ? 0 : voucher.total_quota,
        claim_start_time: toLocalISO(new Date(voucher.claim_start_time)),
        claim_end_time: toLocalISO(new Date(voucher.claim_end_time)),
        valid_until: toLocalISO(new Date(voucher.valid_until)),
        image_url: voucher.image_url,
        is_active: voucher.is_active,
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setIsUnlimited(false);
      setFormData(makeInitialForm());
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);
    setIsUnlimited(false);
    setFormData(makeInitialForm());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        total_quota: isUnlimited ? -1 : formData.total_quota,
        claim_start_time: new Date(formData.claim_start_time).toISOString(),
        claim_end_time: new Date(formData.claim_end_time).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
      };

      if (isEditing && editingId) {
        await fetchAPI(`/admin/vouchers/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        showToast('อัปเดตคูปองสำเร็จ!', 'success');
      } else {
        await fetchAPI('/admin/vouchers', { method: 'POST', body: JSON.stringify(payload) });
        showToast('สร้างคูปองใหม่สำเร็จ!', 'success');
      }
      closeForm();
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
      showToast('ลบคูปองเรียบร้อยแล้ว', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // ── Countdown helpers ─────────────────────────────────────────────────────

  const getClaimEndText = (claimEndTime: string) => {
    const diff = new Date(claimEndTime).getTime() - now;
    if (diff <= 0) return 'หมดเวลาแจกแล้ว';
    if (diff < 48 * 3600000) {
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      return (
        <span className="text-[var(--brand)] font-bold">
          สิ้นสุดในอีก {h > 0 ? `${h} ชม.` : `${m} นาที`}
        </span>
      );
    }
    return `สิ้นสุดแจก ${new Date(claimEndTime).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })} เวลา ${new Date(claimEndTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })} น.`;
  };

  const isExpiringSoon = (t: string) => {
    const diff = new Date(t).getTime() - now;
    return diff > 0 && diff < 48 * 3600000;
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] max-w-[480px] mx-auto">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-zinc-100/50">
        <div className="px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/home')} className="p-2 -ml-2 rounded-xl active:bg-zinc-100 transition-colors">
                <ArrowLeft className="w-5 h-5 text-zinc-600" />
              </button>
              <h1 className="text-[16px] font-extrabold text-zinc-900 tracking-tight">ควบคุมระบบ</h1>
            </div>
            <button
              onClick={() => openForm()}
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in-up">
          {[
            { label: 'แคมเปญ', value: stats?.total_vouchers || 0, icon: LayoutDashboard },
            { label: 'เก็บแล้ว', value: stats?.total_claims || 0, icon: Ticket },
            { label: 'ใช้งานแล้ว', value: stats?.total_redeems || 0, icon: CheckCircle2 },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[24px] p-5 border border-zinc-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] relative overflow-hidden group active:scale-95 transition-all"
            >
              <div className="absolute -right-3 -top-3 w-16 h-16 bg-[var(--brand)]/[0.03] rounded-full blur-xl group-hover:bg-[var(--brand)]/[0.06] transition-colors" />
              <div className="relative z-10 flex flex-col">
                <span className="text-[24px] font-black text-zinc-900 leading-none tracking-tight">{item.value}</span>
                <span className="text-[10px] text-zinc-400 font-bold mt-2 uppercase tracking-wider">{item.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <div className="relative flex items-center bg-white rounded-2xl px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-zinc-100/80 transition-all focus-within:shadow-[0_2px_20px_rgba(218,25,132,0.1)] focus-within:border-[var(--brand)]/20">
            <Search className="w-[18px] h-[18px] text-zinc-400 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="ค้นหาคูปอง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-zinc-900 text-[14px] placeholder:text-zinc-400 font-medium pr-8"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 p-1 rounded-full hover:bg-zinc-100 text-zinc-400 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* List header */}
        <div className="flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-[15px] font-extrabold text-zinc-900">รายการคูปอง</h2>
          <span className="text-[11px] text-zinc-400 font-semibold">{filteredVouchers.length} รายการ</span>
        </div>

        {/* Voucher list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-[88px] rounded-2xl skeleton" />)}
          </div>
        ) : filteredVouchers.length > 0 ? (
          <div className="space-y-2.5 stagger">
            {filteredVouchers.map((v) => (
              <div key={v.id} className="bg-white rounded-2xl border border-zinc-100/60 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden card-interactive">
                <div className="flex items-center p-3 gap-3">
                  <div className="w-[56px] h-[56px] rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                    <img
                      src={getFullImageUrl(v.image_url) || 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=200'}
                      alt={v.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-zinc-900 text-[13px] line-clamp-1 leading-snug">{v.title}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold shrink-0 ${v.is_active ? 'bg-[var(--brand)]/[0.08] text-[var(--brand)]' : 'bg-zinc-100 text-zinc-400'}`}>
                        {v.is_active ? 'เปิดใช้' : 'ปิดใช้'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-zinc-500 font-medium">
                          เก็บแล้ว {v.total_quota === -1 ? `${v.claimed_count} / ∞` : `${v.claimed_count}/${v.total_quota}`}
                        </span>
                        <span className={`text-[9px] ${isExpiringSoon(v.claim_end_time) ? 'text-[var(--brand)]' : 'text-zinc-400'}`}>
                          {getClaimEndText(v.claim_end_time)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openForm(v)} className="p-1.5 rounded-lg text-[var(--brand)] active:bg-[var(--brand)]/[0.06] transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteModal({ show: true, voucherId: v.id })} className="p-1.5 rounded-lg text-zinc-400 active:bg-red-50 active:text-red-500 transition-colors">
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

      {/* Create / Edit Form */}
      {showForm && (
        <AdminVoucherForm
          isEditing={isEditing}
          isUnlimited={isUnlimited}
          voucher={formData}
          onVoucherChange={setFormData}
          onUnlimitedToggle={() => setIsUnlimited((prev) => !prev)}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          onToast={showToast}
        />
      )}

      {/* Delete Confirmation */}
      {deleteModal.show && (
        <AdminDeleteModal
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal({ show: false, voucherId: null })}
        />
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
