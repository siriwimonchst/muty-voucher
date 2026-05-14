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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF5FA] p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[40px] shadow-[0_20px_50px_rgba(218,25,132,0.1)] p-10 border border-white z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-24 h-24 mb-6 transition-transform hover:scale-105 duration-300">
            <Image
              src="/assets/muty_log.png"
              alt="Muty Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            {isLogin ? 'ยินดีต้อนรับ' : 'สร้างบัญชีใหม่'}
          </h2>
          <p className="text-zinc-500 mt-2 text-center">
            {isLogin ? 'เข้าสู่ระบบเพื่อใช้งานคูปองของคุณ' : 'เข้าร่วมกับเราเพื่อรับดีลความงามสุดพิเศษ'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700 ml-1">ชื่อที่แสดง</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-brand transition-colors" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50/50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                  placeholder="ชื่อของคุณ"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700 ml-1">เบอร์โทรศัพท์</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-brand transition-colors" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-50/50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                placeholder="08xxxxxxxx"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700 ml-1">รหัสผ่าน</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-brand transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-50/50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm py-3 px-4 rounded-xl text-center font-medium animate-pulse-soft">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 text-sm py-3 px-4 rounded-xl text-center font-medium">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand/90 text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:scale-100 mt-4 flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'กำลังดำเนินการ...' : isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</span>
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-zinc-500 hover:text-brand font-semibold transition-colors flex items-center justify-center mx-auto"
          >
            {isLogin ? (
              <>ยังไม่มีบัญชี? <span className="text-brand ml-1">สมัครสมาชิกที่นี่</span></>
            ) : (
              <>มีบัญชีอยู่แล้ว? <span className="text-brand ml-1">เข้าสู่ระบบ</span></>
            )}
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-zinc-400 text-xs font-medium">
        © 2026 Muty Voucher. All rights reserved.
      </p>
    </div>
  );
}

