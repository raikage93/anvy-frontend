type Props = {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
};

export default function WheelNoticeModal({ open, title, message, onClose }: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/65 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[32px] bg-white p-7 shadow-[0_40px_80px_rgba(15,23,42,0.32)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-3xl shadow-sm">
          !
        </div>
        <h3 className="mt-5 text-center font-['Manrope'] text-3xl font-extrabold tracking-[-0.04em] text-slate-900">{title}</h3>
        <p className="mt-4 text-center text-sm leading-7 text-slate-600">{message}</p>

        <button
          type="button"
          onClick={onClose}
          className="mt-7 w-full rounded-full bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] px-6 py-3 text-center font-['Manrope'] text-base font-extrabold text-white transition hover:opacity-95"
        >
          Đã hiểu
        </button>
      </div>
    </div>
  );
}
