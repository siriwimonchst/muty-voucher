'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { LogOut, Settings, ChevronRight, History, Shield, Bell } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  const menuItems = [
    { label: 'Voucher History', icon: History, href: '/history' },
    { label: 'Security & Password', icon: Shield, href: '#' },
    { label: 'Settings', icon: Settings, href: '#' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
        <div className="flex flex-col items-center py-8 bg-white rounded-3xl shadow-sm border border-zinc-100">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-brand/10">
              <img 
                src={user.profile_picture_url || 'https://ui-avatars.com/api/?name=' + user.display_name} 
                alt={user.display_name}
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-brand text-white rounded-full shadow-lg border-2 border-white">
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-zinc-900">{user.display_name}</h2>
          <p className="text-sm text-zinc-500">{user.phone_number}</p>
          <span className="mt-2 px-3 py-1 bg-brand/10 text-brand text-[10px] font-bold rounded-full uppercase tracking-wider">
            {user.role} Member
          </span>
        </div>

      {/* Menu List */}
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => item.href !== '#' && router.push(item.href)}
              className={`w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-zinc-50' : ''
              }`}
            >
              <div className="flex items-center">
                <div className="p-2 bg-zinc-100 rounded-xl mr-3 text-zinc-600">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-zinc-800">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-300" />
            </button>
          );
        })}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  );
}
