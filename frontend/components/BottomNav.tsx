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
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[999]">
      {/* Fade-out gradient above nav */}
      <div className="h-6 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />

      <nav className="bg-white/90 backdrop-blur-xl border-t border-zinc-100 shadow-[0_-1px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around h-[var(--nav-height)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 w-full h-full relative transition-colors duration-200 ${
                  isActive
                    ? 'text-[var(--brand)]'
                    : 'text-zinc-400 active:text-zinc-600'
                }`}
              >
                {/* Active indicator pill */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] rounded-b-full bg-[var(--brand)] shadow-[0_2px_8px_rgba(218,25,132,0.4)]" />
                )}
                
                <div className={`transition-transform duration-200 ${isActive ? '-translate-y-0.5 scale-105' : ''}`}>
                  <Icon className={`w-[22px] h-[22px] ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                </div>
                <span className={`text-[10px] leading-none font-semibold tracking-tight transition-opacity ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
        {/* Safe area for iPhone etc. */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}

export default BottomNav;
