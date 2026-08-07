import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-3 max-h-[calc(100vh-1.5rem)] w-[min(100vw-1.5rem,32rem)] overflow-y-auto rounded-[1.5rem] border border-white/15 bg-white/10 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.35)] backdrop-blur-2xl sm:mx-4 sm:max-h-[90vh] sm:rounded-[2rem] sm:w-full sm:max-w-lg">
        <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 transition hover:bg-white/10"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
