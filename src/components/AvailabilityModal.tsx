import { useEffect } from 'react';
import AvailabilitySummary from './AvailabilitySummary';
import type { AvailabilitySetting } from '../types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  settings: AvailabilitySetting[];
};

export default function AvailabilityModal({ isOpen, onClose, settings }: Props) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/75 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-surface shadow-2xl shadow-cyan-950/30 sm:max-h-[min(760px,calc(100dvh-3rem))]">
        <div className="border-b border-white/10 bg-linear-to-r from-cyan-500/10 via-transparent to-primary/10 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-light">Lịch làm việc</p>
              <h2 className="mt-2 text-xl font-semibold text-text sm:text-2xl">Lịch khám khả dụng trong tuần</h2>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                Các ngày và khung giờ ở đây được lấy trực tiếp từ thiết lập của admin.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-text-muted transition hover:border-white/25 hover:text-text"
            >
              Đóng
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <AvailabilitySummary settings={settings} />
        </div>
      </div>
    </div>
  );
}
