'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ticket, User } from 'lucide-react';

const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'หน้าหลัก', href: '/home', icon: Home },
    { label: 'คูปองของฉัน', href: '/my-vouchers', icon: Ticket },
    { label: 'โปรไฟล์', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200">
      <div className="max-w-4xl mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive
                  ? 'text-brand'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
