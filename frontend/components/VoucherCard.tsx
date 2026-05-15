import { useState, useEffect } from 'react';
import { Voucher } from '@/types';
import { Clock, Ticket, Scissors } from 'lucide-react';
import { getFullImageUrl } from '@/lib/utils';

interface VoucherCardProps {
  voucher: Voucher;
  onClaim?: (id: string) => void;
  isClaimed?: boolean;
  isAdmin?: boolean;
}

export default function VoucherCard({ voucher, onClaim, isClaimed, isAdmin }: VoucherCardProps) {
  const [now, setNow] = useState(new Date().getTime());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().getTime()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isUnlimited = voucher.total_quota === -1;
  const remaining = isUnlimited ? Infinity : voucher.total_quota - voucher.claimed_count;
  const progress = isUnlimited ? 0 : (voucher.claimed_count / voucher.total_quota) * 100;

  const getClaimEndText = () => {
    const end = new Date(voucher.claim_end_time).getTime();
    const diff = end - now;

    if (diff > 0 && diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return (
        <span className="font-medium">
          สิ้นสุดในอีก {days > 0 ? `${days} วัน ` : ''}{hours > 0 || days > 0 ? `${hours} ชม.` : `${mins} นาที`}
        </span>
      );
    } else if (diff <= 0) {
      return 'หมดเวลาแจกแล้ว';
    }
    return `สิ้นสุด ${new Date(voucher.claim_end_time).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })} ${new Date(voucher.claim_end_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  };

  const isExpiringSoon = () => {
    const end = new Date(voucher.claim_end_time).getTime();
    const diff = end - now;
    return diff > 0 && diff < 48 * 60 * 60 * 1000;
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.05)] border border-zinc-100/60 overflow-hidden flex h-[100px] group card-interactive w-full">
      {/* Left: Image Section */}
      <div className="w-[88px] h-full relative overflow-hidden bg-zinc-100 shrink-0">
        <img
          src={getFullImageUrl(voucher.image_url) || 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400'}
          alt={voucher.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Middle: Details Section */}
      <div className="flex-1 px-3 py-2.5 flex flex-col justify-between min-w-0 relative">
        <div className="space-y-0.5">
          <h3 className="font-bold text-zinc-900 text-[13px] line-clamp-2 leading-snug">
            {voucher.title}
          </h3>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] gap-2">
            <div className="flex items-center gap-1 min-w-0 text-zinc-400">
              <Clock className="w-3 h-3 shrink-0" />
              <span className="truncate block">{getClaimEndText()}</span>
            </div>
            {isAdmin && !isUnlimited && (
               <span className="font-medium text-zinc-400 shrink-0">
                 เหลือ {remaining}
               </span>
            )}
          </div>
          
          {isAdmin && !isUnlimited && (
            <div className="w-full h-[3px] bg-zinc-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[var(--brand)] to-[var(--brand-light)] transition-all duration-1000" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          )}
        </div>

        {/* Dashed Separator */}
        <div className="absolute -right-[1px] top-3 bottom-3 w-[1px] border-r-2 border-dashed border-zinc-200/80" />
      </div>

      {/* Right: Claim Action Section */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClaim && onClaim(voucher.id);
        }}
        disabled={isClaimed || remaining === 0}
        className={`w-[58px] flex flex-col items-center justify-center gap-1 transition-all shrink-0 ${
          isClaimed || remaining === 0
            ? 'bg-zinc-50 text-zinc-400 cursor-not-allowed'
            : 'bg-gradient-to-b from-[var(--brand)] to-[var(--brand-dark)] text-white active:scale-95 cursor-pointer'
        }`}
      >
        <div className="relative">
          <Ticket className={`w-5 h-5 transition-all duration-300 ${!isClaimed && remaining > 0 ? 'group-hover:rotate-12' : ''}`} />
          {!isClaimed && remaining > 0 && (
            <Scissors className="absolute -top-1 -right-1 w-2.5 h-2.5 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
        <span className="text-[10px] font-bold leading-none">
          {isClaimed ? 'เก็บแล้ว' : remaining === 0 ? 'หมด' : 'เก็บ'}
        </span>
      </button>
    </div>
  );
}
