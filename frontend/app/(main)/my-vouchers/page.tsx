'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { UserVoucher } from '@/types';
import { Search, Tag, Calendar, CheckCircle2, Ticket } from 'lucide-react';

export default function MyVouchersPage() {
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'AVAILABLE' | 'USED'>('AVAILABLE');
  const [search, setSearch] = useState('');

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

  const handleUseVoucher = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการใช้คูปองนี้ที่เคาน์เตอร์ตอนนี้?')) return;
    
    try {
      await fetchAPI(`/user-vouchers/${id}/use`, { method: 'POST' });
      alert('ใช้งานคูปองสำเร็จ!');
      loadMyVouchers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredVouchers = userVouchers.filter(uv => {
    const matchesStatus = uv.status === filter;
    const matchesSearch = uv.voucher_details.title.toLowerCase().includes(search.toLowerCase()) || 
                          uv.voucher_details.shop_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">My Wallet</h2>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาคูปองของคุณ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-brand transition-all text-sm"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-zinc-100 rounded-xl">
          <button
            onClick={() => setFilter('AVAILABLE')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              filter === 'AVAILABLE' 
                ? 'bg-white text-brand shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            พร้อมใช้งาน
          </button>
          <button
            onClick={() => setFilter('USED')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              filter === 'USED' 
                ? 'bg-white text-brand shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            ใช้แล้ว
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => <div key={i} className="h-32 bg-zinc-100 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : filteredVouchers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
          {filteredVouchers.map((uv) => (
            <div 
              key={uv.id} 
              className={`relative overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex ${
                uv.status === 'USED' ? 'grayscale opacity-70' : ''
              }`}
            >
              {/* Left Decoration */}
              <div className={`w-3 ${uv.status === 'AVAILABLE' ? 'bg-brand' : 'bg-zinc-300'}`}></div>
              
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-zinc-900">{uv.voucher_details.title}</h3>
                    {uv.status === 'USED' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  </div>
                  <div className="flex items-center text-xs text-zinc-500 mb-2">
                    <Tag className="w-3 h-3 mr-1" />
                    <span>{uv.voucher_details.shop_name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center text-[10px] text-zinc-500 font-medium">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Expires: {new Date(uv.voucher_details.valid_until).toLocaleDateString()}</span>
                  </div>
                  
                  {uv.status === 'AVAILABLE' && (
                    <button
                      onClick={() => handleUseVoucher(uv.id)}
                      className="px-4 py-1.5 bg-brand hover:bg-brand/90 text-white text-xs font-bold rounded-full transition-all shadow-md shadow-brand/10"
                    >
                      ใช้งานเลย
                    </button>
                  )}
                </div>
              </div>

              {/* Status Badge for Used */}
              {uv.status === 'USED' && (
                <div className="absolute -right-8 top-4 rotate-45 bg-zinc-200 px-10 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  ใช้แล้ว
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8 text-zinc-300" />
          </div>
          <p className="text-zinc-500">คุณยังไม่มีคูปองที่ {filter === 'AVAILABLE' ? 'พร้อมใช้งาน' : 'ใช้แล้ว'}</p>
          <button 
            onClick={() => window.location.href = '/home'}
            className="mt-4 text-brand font-bold text-sm"
          >
            ไปเก็บคูปองกันเลย!
          </button>
        </div>
      )}
    </div>
  );
}
