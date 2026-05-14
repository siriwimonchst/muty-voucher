'use client';

import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  show: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ show, message, type, onClose }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-[400px] animate-fade-in-up">
      <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md ${
        type === 'success' 
          ? 'bg-[var(--brand)]/90 border-[var(--brand)]/30 text-white' 
          : 'bg-red-500/90 border-red-400 text-white'
      }`}>
        {type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 shrink-0" />
        )}
        <p className="text-[13px] font-bold flex-1">{message}</p>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
