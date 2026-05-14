import { Voucher } from '@/types';
import { Clock, Ticket, Users } from 'lucide-react';

interface VoucherCardProps {
  voucher: Voucher;
  onClaim?: (id: string) => void;
  isClaimed?: boolean;
}

export default function VoucherCard({ voucher, onClaim, isClaimed }: VoucherCardProps) {
  const remaining = voucher.total_quota - voucher.claimed_count;
  const progress = (voucher.claimed_count / voucher.total_quota) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-zinc-100 overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={voucher.image_url || 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400'}
          alt={voucher.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-brand text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
          {voucher.category}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-zinc-900 line-clamp-1">{voucher.title}</h3>
          <span className="text-brand font-bold text-sm">
            {voucher.discount_type === 'percent' ? `${voucher.discount_value}% OFF` : `฿${voucher.discount_value} OFF`}
          </span>
        </div>
        <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{voucher.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center text-[11px] text-zinc-600">
            <Clock className="w-3 h-3 mr-1" />
            <span>Valid until: {new Date(voucher.valid_until).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center justify-between text-[11px] text-zinc-600">
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              <span>{voucher.claimed_count}/{voucher.total_quota} claimed</span>
            </div>
            <span className={remaining <= 5 ? 'text-red-500 font-bold animate-pulse' : ''}>
              {remaining} left
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={() => onClaim && onClaim(voucher.id)}
          disabled={isClaimed || remaining === 0}
          className={`w-full mt-4 py-2 rounded-xl text-sm font-bold transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
            isClaimed
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
              : 'bg-brand hover:bg-brand/90 text-white shadow-md shadow-brand/20'
          }`}
        >
          <Ticket className="w-4 h-4" />
          {isClaimed ? 'Claimed' : remaining === 0 ? 'Fully Claimed' : 'Claim Now'}
        </button>
      </div>
    </div>
  );
}
