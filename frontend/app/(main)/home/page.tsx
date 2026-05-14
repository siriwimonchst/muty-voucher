'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { Voucher } from '@/types';
import VoucherCard from '@/components/VoucherCard';
import { Search } from 'lucide-react';

export default function HomePage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVouchers();
  }, []);

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
      alert('เก็บคูปองสำเร็จ! ไปดูที่หน้า คูปองของฉัน');
    } catch (err: any) {
      alert(err.message === 'Voucher already claimed' ? 'คุณเก็บคูปองนี้ไปแล้ว' : err.message);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Banner / Ad Area */}
      <div className="relative h-40 rounded-3xl overflow-hidden shadow-lg group">
        <img 
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          alt="Cosmetic Promo"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
          <span className="text-brand text-xs font-bold uppercase tracking-widest mb-1">โปรโมชั่นประจำฤดูกาล</span>
          <h2 className="text-white text-2xl font-bold">Sparkle & Shine</h2>
          <p className="text-white/80 text-sm">ลดสูงสุด 50% สำหรับสินค้าดูแลผิว</p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="ค้นหาแบรนด์เครื่องสำอางหรือดีลสุดคุ้ม..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-brand outline-none transition-all shadow-sm"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
      </form>

      {/* Vouchers Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900">รางวัลพิเศษ</h2>
          <span className="text-xs text-brand font-bold px-2 py-1 bg-brand/10 rounded-lg animate-pulse">
            ใกล้หมดเขตแล้ว!
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="h-64 bg-zinc-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : vouchers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
            {vouchers.map((v) => (
              <VoucherCard 
                key={v.id} 
                voucher={v} 
                onClaim={handleClaim} 
                isClaimed={claimedIds.includes(v.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-500">ไม่พบคูปองที่ตรงกับการค้นหาของคุณ</p>
          </div>
        )}
      </div>
    </div>
  );
}
