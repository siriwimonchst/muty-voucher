'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { Voucher } from '@/types';
import { Plus, LayoutDashboard, Ticket, Trash2 } from 'lucide-react';

export default function AdminPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // New Voucher State
  const [newVoucher, setNewVoucher] = useState({
    title: '',
    description: '',
    shop_name: 'Muty Cosmetics',
    category: 'Skincare',
    discount_type: 'percent',
    discount_value: 20,
    total_quota: 50,
    claim_start_time: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
    claim_end_time: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] + 'T23:59:59Z',
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] + 'T23:59:59Z',
    image_url: '',
    is_active: true
  });

  useEffect(() => {
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/admin/vouchers', {
        method: 'POST',
        body: JSON.stringify(newVoucher)
      });
      setShowModal(false);
      loadData();
      alert('Voucher created!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 bg-zinc-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ควบคุมระบบ (Admin)</h1>
            <p className="text-zinc-500 text-sm">จัดการคูปองสำหรับร้านเครื่องสำอาง</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all"
          >
            <Plus className="w-5 h-5" />
            สร้างคูปองใหม่
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
            <LayoutDashboard className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">แคมเปญทั้งหมด</p>
            <p className="text-2xl font-bold">{stats?.total_vouchers || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
            <Ticket className="w-5 h-5 text-brand mb-2" />
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">จำนวนที่เก็บ</p>
            <p className="text-2xl font-bold">{stats?.total_claims || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
            <Plus className="w-5 h-5 text-green-500 mb-2" />
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">จำนวนที่ใช้</p>
            <p className="text-2xl font-bold">{stats?.total_redeems || 0}</p>
          </div>
        </div>

        {/* Voucher List */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">ชื่อคูปอง</th>
                <th className="px-6 py-4">ร้าน</th>
                <th className="px-6 py-4">เก็บแล้ว</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {vouchers.map((v) => (
                <tr key={v.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-zinc-900 text-sm">{v.title}</p>
                    <p className="text-zinc-500 text-[10px]">{v.category}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{v.shop_name}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">{v.claimed_count}/{v.total_quota}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${v.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {v.is_active ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Simplistic */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">สร้างคูปองใหม่</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">ชื่อคูปอง</label>
                <input 
                  type="text" 
                  value={newVoucher.title}
                  onChange={(e) => setNewVoucher({...newVoucher, title: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-brand" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">จำนวนคูปอง (โควต้า)</label>
                  <input 
                    type="number" 
                    value={newVoucher.total_quota}
                    onChange={(e) => setNewVoucher({...newVoucher, total_quota: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-brand" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">หมวดหมู่</label>
                  <select 
                    value={newVoucher.category}
                    onChange={(e) => setNewVoucher({...newVoucher, category: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="Skincare">ดูแลผิว (Skincare)</option>
                    <option value="Makeup">แต่งหน้า (Makeup)</option>
                    <option value="Fragrance">น้ำหอม (Fragrance)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">ใช้ได้จนถึงวันที่</label>
                <input 
                  type="datetime-local" 
                  onChange={(e) => setNewVoucher({...newVoucher, valid_until: new Date(e.target.value).toISOString()})}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-brand" 
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-zinc-500 font-bold hover:bg-zinc-50 rounded-xl transition-all">ยกเลิก</button>
                <button type="submit" className="flex-1 py-3 bg-brand text-white font-bold rounded-xl shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all">บันทึกแคมเปญ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
