'use client';

import { Bell, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const router = useRouter();

  const notifications = [
    { 
      id: 1, 
      title: 'Welcome to Muty Voucher! 💖', 
      message: 'Claim your first lipstick discount now.', 
      time: 'Just now',
      isRead: false 
    },
    { 
      id: 2, 
      title: 'Flash Sale Alert! ⚡', 
      message: 'Skincare products are now 30% off for limited time.', 
      time: '2 hours ago',
      isRead: true 
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black max-w-md mx-auto shadow-xl">
      <header className="sticky top-0 z-40 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 px-4 py-4 flex items-center">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-zinc-600 dark:text-zinc-400">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold ml-2 dark:text-white">Notifications</h1>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {notifications.map((n) => (
          <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.isRead ? 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800' : 'bg-pink-50 dark:bg-pink-900/10 border-pink-100 dark:border-pink-900/20 shadow-sm'}`}>
            <div className="flex justify-between items-start mb-1">
              <h3 className={`text-sm font-bold ${n.isRead ? 'text-zinc-900 dark:text-white' : 'text-pink-600 dark:text-pink-400'}`}>
                {n.title}
              </h3>
              {!n.isRead && <span className="w-2 h-2 bg-pink-500 rounded-full"></span>}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{n.message}</p>
            <span className="text-[10px] text-zinc-400 mt-2 block">{n.time}</span>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-20">
            <Bell className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-500">No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
