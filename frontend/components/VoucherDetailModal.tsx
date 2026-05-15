import { useState, useEffect } from 'react';
import { Voucher } from '@/types';
import { X, Clock, Ticket, Share2 } from 'lucide-react';
import { getFullImageUrl } from '@/lib/utils';

interface VoucherDetailModalProps {
  voucher: Voucher;
  isOpen: boolean;
  onClose: () => void;
  actionText: string;
  onAction: (id: string) => void;
  isActionDisabled: boolean;
  statusText?: string;
}

export default function VoucherDetailModal({
  voucher,
  isOpen,
  onClose,
  actionText,
  onAction,
  isActionDisabled,
  statusText
}: VoucherDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const isUnlimited = voucher.total_quota === -1;
  const remaining = isUnlimited ? Infinity : voucher.total_quota - voucher.claimed_count;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-50/95 sm:bg-black/50 backdrop-blur-sm sm:p-4 sm:justify-center animate-fade-in">
      {/* Mobile: full screen, Desktop: centered modal */}
      <div className="bg-white w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:mx-auto sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden relative animate-slide-up sm:animate-scale-in">
        
        {/* Close button - Fixed at top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors z-[60]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto min-h-0 w-full">
          {/* Header / Image area */}
          <div className="relative w-full aspect-[4/3] bg-zinc-100 shrink-0">
            <img
              src={getFullImageUrl(voucher.image_url) || 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=600'}
              alt={voucher.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content area */}
          <div className="px-5 py-6">
          <div className="flex justify-between items-start gap-4 mb-3">
            <h2 className="text-[18px] font-extrabold text-zinc-900 leading-snug">
              {voucher.title}
            </h2>
          </div>

          <div className="flex items-center text-zinc-500 text-[12px] mb-6 gap-1.5">
            <Clock className="w-4 h-4 text-zinc-400" />
            <span className="font-medium">
              หมดอายุ {new Date(voucher.valid_until).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onAction(voucher.id)}
            disabled={isActionDisabled}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 mb-8 transition-all ${
              isActionDisabled
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[var(--brand)] to-[var(--brand-dark)] text-white shadow-[0_8px_20px_rgba(218,25,132,0.25)] active:scale-95'
            }`}
          >
            <Ticket className="w-5 h-5" />
            <span className="text-[15px]">{statusText || actionText}</span>
          </button>

          {/* Description & Quota */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 text-[14px]">เงื่อนไขการใช้สิทธิ์</h3>
              {!isUnlimited && (
                <div className="bg-zinc-100 text-zinc-500 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                  <Ticket className="w-3 h-3" />
                  ทั้งหมด {voucher.total_quota} สิทธิ์
                </div>
              )}
            </div>
            
            <div className="text-[13px] text-zinc-600 leading-relaxed whitespace-pre-wrap font-medium">
              {voucher.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
            </div>
          </div>
          
          <div className="h-6"></div>
        </div>
      </div>
    </div>
    </div>
  );
}
