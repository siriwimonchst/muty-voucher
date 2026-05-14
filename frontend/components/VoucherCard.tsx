import { Voucher } from '@/types';
import { Clock, Ticket, Scissors } from 'lucide-react';

interface VoucherCardProps {
  voucher: Voucher;
  onClaim?: (id: string) => void;
  isClaimed?: boolean;
}

export default function VoucherCard({ voucher, onClaim, isClaimed }: VoucherCardProps) {
  const isUnlimited = voucher.total_quota === -1;
  const remaining = isUnlimited ? Infinity : voucher.total_quota - voucher.claimed_count;
  const progress = isUnlimited ? 0 : (voucher.claimed_count / voucher.total_quota) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.05)] border border-zinc-100/60 overflow-hidden flex h-[100px] group card-interactive w-full">
      {/* Left: Image Section */}
      <div className="w-[88px] h-full relative overflow-hidden bg-zinc-100 shrink-0">
        <img
          src={voucher.image_url || 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400'}
          alt={voucher.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Middle: Details Section */}
      <div className="flex-1 px-3 py-2.5 flex flex-col justify-between min-w-0 relative">
        <div className="space-y-0.5">
          <h3 className="font-bold text-zinc-900 text-[13px] line-clamp-1 leading-snug">
            {voucher.title}
          </h3>
          
          <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
            {voucher.description}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <div className="text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="truncate">สิ้นสุดการแจก {new Date(voucher.claim_end_time).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
            </div>
            {!isUnlimited && (
               <span className={`font-bold shrink-0 ${remaining <= 5 ? 'text-[var(--brand)] animate-pulse' : 'text-zinc-300'}`}>
                 เหลือ {remaining}
               </span>
            )}
          </div>
          
          {!isUnlimited && (
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
        onClick={() => onClaim && onClaim(voucher.id)}
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
