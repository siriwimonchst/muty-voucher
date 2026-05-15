'use client';

import { useRef, useState } from 'react';
import { Camera, Upload, Calendar, X } from 'lucide-react';
import { getFullImageUrl } from '@/lib/utils';

export type VoucherFormData = {
  title: string;
  description: string;
  shop_name: string;
  discount_type: string;
  discount_value: number;
  total_quota: number;
  claim_start_time: string;
  claim_end_time: string;
  valid_until: string;
  image_url: string;
  is_active: boolean;
};

interface AdminVoucherFormProps {
  isEditing: boolean;
  isUnlimited: boolean;
  voucher: VoucherFormData;
  onVoucherChange: (v: VoucherFormData) => void;
  onUnlimitedToggle: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

const INPUT_CLS = 'w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)]/30 transition-all text-[14px]';
const DATETIME_CLS = `${INPUT_CLS} font-medium text-zinc-700 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:left-0 z-10 relative`;
const LABEL_CLS = 'block text-[12px] font-bold text-zinc-500 mb-1.5';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080';

export default function AdminVoucherForm({
  isEditing,
  isUnlimited,
  voucher,
  onVoucherChange,
  onUnlimitedToggle,
  onSubmit,
  onCancel,
  onToast,
}: AdminVoucherFormProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<VoucherFormData>) => onVoucherChange({ ...voucher, ...patch });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onToast('ขนาดรูปภาพต้องไม่เกิน 5MB', 'error');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${API_BASE}/api/auth/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload');
      const data = await res.json();
      set({ image_url: data.url });
      onToast('อัปโหลดรูปภาพสำเร็จ!', 'success');
    } catch (err: any) {
      onToast(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onCancel}>
      <div
        className="absolute inset-x-0 bottom-0 bg-white rounded-t-[28px] max-h-[92dvh] overflow-y-auto animate-slide-up max-w-[480px] mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle + Header */}
        <div className="sticky top-0 bg-white rounded-t-[28px] z-10 pt-3 pb-2 px-5">
          <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-extrabold text-zinc-900">
              {isEditing ? 'แก้ไขคูปอง' : 'สร้างคูปองใหม่'}
            </h2>
            <button onClick={onCancel} className="p-2 -mr-2 rounded-xl active:bg-zinc-100 transition-colors">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="px-5 pb-[max(env(safe-area-inset-bottom),24px)] space-y-4">
          {/* Title */}
          <div>
            <label className={LABEL_CLS}>ชื่อคูปอง</label>
            <input
              type="text"
              value={voucher.title}
              onChange={(e) => set({ title: e.target.value })}
              className={INPUT_CLS}
              placeholder="เช่น ส่วนลด 50% สำหรับชิ้นแรก"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={LABEL_CLS}>รายละเอียด</label>
            <textarea
              value={voucher.description}
              onChange={(e) => set({ description: e.target.value })}
              className={`${INPUT_CLS} h-20 resize-none`}
              placeholder="ใส่รายละเอียดคูปองและเงื่อนไข..."
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className={LABEL_CLS}>รูปภาพคูปอง</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
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
              ) : voucher.image_url ? (
                <>
                  <img src={getFullImageUrl(voucher.image_url)} alt="Preview" className="w-full h-full object-cover" />
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

          {/* Quota */}
          <div>
            <label className={LABEL_CLS}>จำนวนคูปอง (โควต้า)</label>
            <div className="flex gap-3">
              <input
                type="number"
                value={isUnlimited ? '' : voucher.total_quota || ''}
                onChange={(e) => set({ total_quota: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                disabled={isUnlimited}
                className={`flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--brand)]/20 transition-all text-[14px] font-bold ${isUnlimited ? 'opacity-40' : ''}`}
                placeholder={isUnlimited ? '∞ ไม่จำกัด' : 'ระบุจำนวน'}
                required={!isUnlimited}
              />
              <button
                type="button"
                onClick={onUnlimitedToggle}
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
              onClick={() => set({ is_active: !voucher.is_active })}
              className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-all duration-300 ${voucher.is_active ? 'bg-[var(--brand)]' : 'bg-zinc-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${voucher.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>

          {/* Dates */}
          <div className="border-t border-zinc-100 pt-5 mt-2">
            <h3 className="text-[14px] font-extrabold text-zinc-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--brand)]" />
              กำหนดเวลา
            </h3>
            <div className="space-y-4">
              {[
                { label: 'เริ่มแจก', key: 'claim_start_time' as const },
                { label: 'สิ้นสุดการแจก', key: 'claim_end_time' as const },
                { label: 'วันหมดอายุคูปอง', key: 'valid_until' as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className={LABEL_CLS}>{label}</label>
                  <div className="relative group">
                    <input
                      type="datetime-local"
                      value={voucher[key]}
                      onChange={(e) => set({ [key]: e.target.value })}
                      className={DATETIME_CLS}
                      required
                    />
                    <Calendar className="w-5 h-5 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-[var(--brand)] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[var(--brand)] to-[var(--brand-dark)] text-white font-bold text-[14px] rounded-xl shadow-[0_4px_16px_rgba(218,25,132,0.3)] active:scale-[0.98] transition-transform"
            >
              {isEditing ? 'บันทึกการแก้ไข' : 'ยืนยันสร้างคูปอง'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3.5 bg-zinc-100 text-zinc-500 font-bold text-[14px] rounded-xl active:bg-zinc-200 transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
