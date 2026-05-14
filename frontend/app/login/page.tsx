'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const data = await fetchAPI('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ phone_number: phone, password }),
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/home');
      } else {
        await fetchAPI('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ phone_number: phone, password, display_name: displayName }),
        });
        setIsLogin(true);
        setPassword(''); // Clear password for security
        setSuccess('สมัครสมาชิกสำเร็จแล้ว! กรุณาเข้าสู่ระบบ');
      }
    } catch (err: any) {
      setError(err.message === 'Invalid credentials' ? 'เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-8 border border-zinc-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-brand/20">
            M
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">
            {isLogin ? 'ยินดีต้อนรับ!' : 'สร้างบัญชีใหม่'}
          </h2>
          <p className="text-zinc-500 mt-1">
            {isLogin ? 'เข้าสู่ระบบเพื่อใช้งานคูปองของคุณ' : 'เข้าร่วมกับเราเพื่อรับดีลความงามสุดพิเศษ'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">ชื่อที่แสดง</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                placeholder="ชื่อของคุณ"
                required={!isLogin}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">เบอร์โทรศัพท์</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              placeholder="08xxxxxxxx"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          {success && <p className="text-sm text-green-500 text-center font-medium">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:scale-100 mt-6"
          >
            {loading ? 'กำลังดำเนินการ...' : isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-zinc-600 hover:text-brand font-medium transition-colors"
          >
            {isLogin ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ"}
          </button>
        </div>
      </div>
    </div>
  );
}
