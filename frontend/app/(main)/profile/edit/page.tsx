'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, User, Save, Upload, CheckCircle2 } from 'lucide-react';
import { fetchAPI } from '@/lib/api';
import Toast from '@/components/Toast';

export default function EditProfilePage() {
  const [displayName, setDisplayName] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080';

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const data = await fetchAPI('/auth/me');
      setDisplayName(data.display_name);
      setProfilePictureUrl(data.profile_picture_url || '');
    } catch (err) {
      console.error('Failed to load profile:', err);
      router.push('/profile');
    } finally {
      setInitialLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error');
      return;
    }

    // Validate file size (max 5MB)
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
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload image');
      
      const data = await response.json();
      setProfilePictureUrl(data.url);
      showToast('อัปโหลดรูปภาพสำเร็จ!', 'success');
    } catch (err: any) {
      showToast(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด', 'error');
    } finally {
      setUploading(false);
    }
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showToast('กรุณากรอกชื่อที่ต้องการแสดง', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchAPI('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          display_name: displayName,
          profile_picture_url: profilePictureUrl
        })
      });

      // Update local storage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showToast('อัปเดตโปรไฟล์สำเร็จ!', 'success');
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err: any) {
      showToast(err.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-8 h-8 border-4 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] max-w-[480px] mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-zinc-100/50">
        <div className="px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3 flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl active:bg-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-600" />
          </button>
          <div>
            <h1 className="text-[16px] font-extrabold text-zinc-900 tracking-tight">แก้ไขโปรไฟล์</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div 
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] shadow-lg shadow-[var(--brand)]/20 overflow-hidden">
                <div className="w-full h-full rounded-full bg-white overflow-hidden p-0.5 relative">
                  <img 
                    src={getFullImageUrl(profilePictureUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=DA1984&color=fff&size=200`} 
                    alt="Profile Preview"
                    className={`w-full h-full rounded-full object-cover transition-all duration-500 group-hover:scale-110 ${uploading ? 'opacity-40 blur-[2px]' : ''}`}
                  />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              
              {/* Floating Camera Button */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md border border-zinc-100 flex items-center justify-center text-[var(--brand)] group-hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-4 text-[12px] text-zinc-400 font-medium">แตะที่รูปเพื่อเปลี่ยนรูปภาพใหม่</p>
          </div>

          <div className="space-y-5">
            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-zinc-500 ml-1">ชื่อที่แสดงในแอป</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="กรอกชื่อของคุณ"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)]/30 transition-all text-[14px] font-semibold text-zinc-800 shadow-sm"
                  spellCheck="false"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full py-4 bg-gradient-to-r from-[var(--brand)] to-[var(--brand-dark)] text-white font-bold text-[15px] rounded-2xl shadow-[0_8px_24px_rgba(218,25,132,0.3)] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  ยืนยันการแก้ไขโปรไฟล์
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
