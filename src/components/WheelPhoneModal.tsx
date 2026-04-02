import { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  initialPhone?: string;
  loading?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (phone: string) => void;
};

export default function WheelPhoneModal({
  open,
  initialPhone = '',
  loading = false,
  error = '',
  onClose,
  onSubmit,
}: Props) {
  const [phone, setPhone] = useState(initialPhone);

  useEffect(() => {
    if (open) {
      setPhone(initialPhone);
    }
  }, [open, initialPhone]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/65 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[32px] bg-white p-7 shadow-[0_40px_80px_rgba(15,23,42,0.32)]">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#005eb8]">Xác minh trước khi quay</p>
        <h3 className="mt-3 font-['Manrope'] text-3xl font-extrabold tracking-[-0.04em] text-slate-900">
          Nhập số điện thoại nhận quà
        </h3>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Số điện thoại này sẽ được dùng để xác minh khi nhận thưởng tại phòng khám. Vui lòng nhập đúng số bạn đang sử dụng.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(phone);
          }}
        >
          <label className="block text-sm text-slate-600">
            <span className="mb-2 block font-medium">Số điện thoại</span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Ví dụ: 0901234567"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#005eb8] focus:ring-2 focus:ring-[#005eb8]/20"
            />
          </label>

          {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] px-6 py-3 text-center font-['Manrope'] text-base font-extrabold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Đang kiểm tra...' : 'Xác nhận và quay'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-full border border-slate-300 bg-white px-6 py-3 text-center font-['Manrope'] text-base font-bold text-slate-700 transition hover:border-[#00478d] hover:text-[#00478d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Đóng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
