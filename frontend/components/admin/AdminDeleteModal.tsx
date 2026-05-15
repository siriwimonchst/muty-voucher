import { Trash } from 'lucide-react';

interface AdminDeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AdminDeleteModal({ onConfirm, onCancel }: AdminDeleteModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-t-[28px] w-full max-w-[480px] p-6 pb-[max(env(safe-area-inset-bottom),24px)] shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto mb-6" />

        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Trash className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-extrabold text-center text-zinc-900 mb-1">ยืนยันการลบคูปอง</h3>
        <p className="text-zinc-500 text-center text-[13px] leading-relaxed mb-6">
          คุณแน่ใจหรือไม่ว่าต้องการลบคูปองนี้? <br />
          <span className="text-red-500 font-bold text-[11px]">การลบจะไม่สามารถกู้คืนได้</span>
        </p>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onConfirm}
            className="w-full py-3.5 bg-red-500 text-white font-bold text-[14px] rounded-xl active:scale-[0.98] transition-transform"
          >
            ยืนยันการลบ
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3.5 bg-zinc-100 text-zinc-500 font-bold text-[14px] rounded-xl active:bg-zinc-200 transition-colors"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}
