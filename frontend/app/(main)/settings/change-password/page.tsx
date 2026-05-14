'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { fetchAPI } from '@/lib/api';
import Toast from '@/components/Toast';

export default function ChangePasswordPage() {
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });
  const router = useRouter();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('รหัสผ่านใหม่ไม่ตรงกัน', 'error');
      return;
    }

    if (passwords.newPassword.length < 6) {
      showToast('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร', 'error');
      return;
    }

    setLoading(true);
    try {
      // Assuming backend endpoint exists or will be created
      await fetchAPI('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          old_password: passwords.oldPassword,
          new_password: passwords.newPassword
        })
      });
      
      showToast('เปลี่ยนรหัสผ่านสำเร็จ!', 'success');
      setTimeout(() => router.back(), 2000);
    } catch (err: any) {
      showToast(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-50">
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
            <h1 className="text-lg font-extrabold text-zinc-900 tracking-tight">เปลี่ยนรหัสผ่าน</h1>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-6 py-8 animate-fade-in-up">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-[var(--brand)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[var(--brand)]" />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 mb-2">ตั้งค่ารหัสผ่านใหม่</h2>
          <p className="text-zinc-400 text-sm">กรุณากรอกรหัสผ่านเดิมเพื่อยืนยันตัวตน และรหัสผ่านใหม่ที่ต้องการเปลี่ยน</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Old Password */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-zinc-500 ml-1">รหัสผ่านเดิม</label>
            <div className="relative">
              <input
                type={showPasswords.old ? 'text' : 'password'}
                required
                placeholder="กรอกรหัสผ่านเดิม"
                value={passwords.oldPassword}
                onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                className="w-full bg-white border border-zinc-100 rounded-xl px-4 py-3.5 text-[14px] outline-none transition-all focus:border-[var(--brand)]/30 focus:shadow-[0_4px_20px_rgba(218,25,132,0.05)] shadow-sm"
              />
              <button 
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300 active:text-[var(--brand)]"
              >
                {showPasswords.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5 pt-2">
            <label className="text-[12px] font-bold text-zinc-500 ml-1">รหัสผ่านใหม่</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                required
                placeholder="กรอกรหัสผ่านใหม่"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full bg-white border border-zinc-100 rounded-xl px-4 py-3.5 text-[14px] outline-none transition-all focus:border-[var(--brand)]/30 focus:shadow-[0_4px_20px_rgba(218,25,132,0.05)] shadow-sm"
              />
              <button 
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300 active:text-[var(--brand)]"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-zinc-500 ml-1">ยืนยันรหัสผ่านใหม่</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                required
                placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full bg-white border border-zinc-100 rounded-xl px-4 py-3.5 text-[14px] outline-none transition-all focus:border-[var(--brand)]/30 focus:shadow-[0_4_20px_rgba(218,25,132,0.05)] shadow-sm"
              />
              <button 
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300 active:text-[var(--brand)]"
              >
                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[var(--brand)] to-[var(--brand-dark)] text-white font-extrabold text-[15px] rounded-xl shadow-[0_8px_32px_rgba(218,25,132,0.3)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  บันทึกรหัสผ่านใหม่
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(prev => ({ ...prev, show: false }))} 
      />
    </div>
  );
}
