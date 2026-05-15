'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import Image from 'next/image';
import { Phone, Lock, User, ArrowRight } from 'lucide-react';

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
        if (password.length < 6) {
          setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
          setLoading(false);
          return;
        }
        await fetchAPI('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ phone_number: phone, password, display_name: displayName }),
        });
        setIsLogin(true);
        setPassword('');
        setSuccess('สมัครสมาชิกสำเร็จแล้ว! กรุณาเข้าสู่ระบบ');
      }
    } catch (err: any) {
      const errorMap: { [key: string]: string } = {
        'Invalid phone number or password': 'เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง',
        'Invalid credentials': 'เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง',
        'Phone number already registered': 'เบอร์โทรศัพท์นี้ถูกลงทะเบียนไว้แล้ว',
        'Phone number and password are required': 'กรุณากรอกเบอร์โทรศัพท์และรหัสผ่าน',
        'Password must be at least 6 characters long': 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
        'Invalid request body': 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
        'Failed to create user': 'เกิดข้อผิดพลาดในการสร้างบัญชี',
        'Login failed': 'เข้าสู่ระบบไม่สำเร็จ'
      };
      setError(errorMap[err.message] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] p-6 relative overflow-hidden">
      {/* Premium decorative background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-[var(--brand)]/[0.04] rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] bg-[var(--brand)]/[0.04] rounded-full blur-[120px] mix-blend-multiply" />
      </div>

      <div className="w-full max-w-md bg-white rounded-[32px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-zinc-100 p-8 sm:p-10 z-10 animate-fade-in-up">
        <div className="flex flex-col items-center mb-6 space-y-2">
          <div className="relative w-20 h-20 mb-2">
            <Image
              src="/assets/muty_log.png"
              alt="Muty Logo"
              fill
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
          <p className="text-[13px] text-zinc-500 text-center font-medium">
            {isLogin ? (
              <>เข้าสู่ระบบเพื่อรับคูปอง<br />และสิทธิพิเศษอื่นๆอีกมากมาย</>
            ) : (
              'สมัครสมาชิกวันนี้เพื่อรับดีลความงามสุดพิเศษ'
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-[12px] font-bold text-zinc-500 ml-1">ชื่อที่แสดง</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-400 group-focus-within:text-[var(--brand)] transition-colors" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-50/50 border border-zinc-200/80 rounded-xl focus:bg-white focus:ring-4 focus:ring-[var(--brand)]/10 focus:border-[var(--brand)]/30 outline-none transition-all text-[14px] font-medium placeholder:text-zinc-400 placeholder:font-normal"
                  placeholder="ชื่อของคุณ"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-zinc-500 ml-1">เบอร์โทรศัพท์</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-400 group-focus-within:text-[var(--brand)] transition-colors" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-zinc-50/50 border border-zinc-200/80 rounded-xl focus:bg-white focus:ring-4 focus:ring-[var(--brand)]/10 focus:border-[var(--brand)]/30 outline-none transition-all text-[14px] font-medium placeholder:text-zinc-400 placeholder:font-normal"
                placeholder="08xxxxxxxx"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-zinc-500 ml-1">รหัสผ่าน</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-400 group-focus-within:text-[var(--brand)] transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-zinc-50/50 border border-zinc-200/80 rounded-xl focus:bg-white focus:ring-4 focus:ring-[var(--brand)]/10 focus:border-[var(--brand)]/30 outline-none transition-all text-[14px] font-medium placeholder:text-zinc-400 placeholder:font-normal"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50/80 border border-red-100 text-red-600 text-[13px] py-3 px-4 rounded-xl flex items-center justify-center font-bold animate-fade-in">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50/80 border border-green-100 text-green-600 text-[13px] py-3 px-4 rounded-xl flex items-center justify-center font-bold animate-fade-in">
              {success}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-gradient text-white font-bold py-3.5 rounded-xl shadow-[0_8px_20px_rgba(218,25,132,0.25)] hover:shadow-[0_8px_25px_rgba(218,25,132,0.35)] transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 group"
            >
              <span className="text-[14px] tracking-wide">{loading ? 'กำลังดำเนินการ...' : isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</span>
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
          <p className="text-[13px] text-zinc-500 font-medium">
            {isLogin ? 'ยังไม่มีบัญชีใช่ไหม?' : 'มีบัญชีอยู่แล้ว?'}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="ml-1.5 text-[var(--brand)] font-bold hover:underline underline-offset-4"
            >
              {isLogin ? 'สมัครสมาชิกฟรี' : 'เข้าสู่ระบบ'}
            </button>
          </p>
        </div>
      </div>
      
      <p className="absolute bottom-6 text-zinc-400 text-[11px] font-bold tracking-wider">
        © 2026 MUTY VOUCHER. ALL RIGHTS RESERVED.
      </p>
    </div>
  );
}

