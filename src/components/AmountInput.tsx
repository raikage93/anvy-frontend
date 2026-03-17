import { useState, useRef, useEffect } from 'react';
import { formatVND, parseAmount, readNumber } from '../utils/format';

interface Props {
  onGenerate: (amount: number) => void;
}

export default function AmountInput({ onGenerate }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const amount = parseAmount(value);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 13) return; // max ~10 trillion
    setValue(raw ? formatVND(raw) : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > 0) onGenerate(amount);
  };

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1.5">Số tiền</label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={value}
            onChange={handleChange}
            placeholder="0"
            className="w-full bg-surface-light border border-border rounded-xl px-4 py-4 pr-16 text-2xl font-bold text-text placeholder:text-text-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-right"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-medium">VNĐ</span>
        </div>
        {amount > 0 && (
          <p className="text-xs text-accent mt-1.5 italic text-right capitalize">{readNumber(amount)}</p>
        )}
      </div>

      {/* Quick amounts */}
      <div className="grid grid-cols-3 gap-2">
        {quickAmounts.map(q => (
          <button
            key={q}
            type="button"
            onClick={() => { setValue(formatVND(q)); }}
            className="py-2 rounded-lg bg-surface-lighter text-sm text-text-muted hover:bg-primary/20 hover:text-primary transition-all active:scale-95"
          >
            {formatVND(q)}
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={amount <= 0}
        className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-lg hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75H16.5v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75H16.5v-.75z" />
        </svg>
        Tạo mã QR
      </button>
    </form>
  );
}
