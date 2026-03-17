import { useState, useEffect, useMemo } from 'react';
import type { BankInfo, DefaultInfo } from '../types';
import { fetchBanks } from '../services/vietqr';

interface Props {
  initialData?: DefaultInfo | null;
  onSave: (info: DefaultInfo) => void;
  onCancel?: () => void;
}

export default function DefaultInfoForm({ initialData, onSave, onCancel }: Props) {
  const [banks, setBanks] = useState<BankInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedBank, setSelectedBank] = useState<{ bin: string; name: string; logo: string } | null>(
    initialData ? { bin: initialData.bankBin, name: initialData.bankName, logo: initialData.bankLogo } : null
  );
  const [accountNo, setAccountNo] = useState(initialData?.accountNo || '');
  const [description, setDescription] = useState(initialData?.description || '');

  useEffect(() => {
    fetchBanks()
      .then(setBanks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (initialData && banks.length > 0) {
      setSearch(initialData.bankName);
    }
  }, [initialData, banks]);

  const filteredBanks = useMemo(() => {
    if (!search) return banks;
    const q = search.toLowerCase();
    return banks.filter(b =>
      b.shortName.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q)
    );
  }, [search, banks]);

  const handleSelectBank = (bank: BankInfo) => {
    setSelectedBank({ bin: bank.bin, name: bank.shortName, logo: bank.logo });
    setSearch(bank.shortName);
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank || !accountNo.trim()) return;
    onSave({
      bankBin: selectedBank.bin,
      bankName: selectedBank.name,
      bankLogo: selectedBank.logo,
      accountNo: accountNo.trim(),
      description: description.trim(),
    });
  };

  const isValid = selectedBank && accountNo.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-text">Thông tin tài khoản</h2>
        <p className="text-sm text-text-muted mt-1">Nhập thông tin nhận tiền mặc định</p>
      </div>

      {/* Bank Selection */}
      <div className="relative">
        <label className="block text-sm font-medium text-text-muted mb-1.5">Ngân hàng</label>
        <div className="relative">
          {selectedBank && (
            <img
              src={selectedBank.logo}
              alt=""
              className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded object-contain bg-white"
            />
          )}
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); setSelectedBank(null); }}
            onFocus={() => setShowDropdown(true)}
            placeholder={loading ? 'Đang tải...' : 'Tìm ngân hàng...'}
            className={`w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${selectedBank ? 'pl-12' : ''}`}
            disabled={loading}
          />
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {showDropdown && !loading && (
          <div className="absolute z-50 mt-1 w-full bg-surface-light border border-border rounded-xl shadow-2xl max-h-60 overflow-y-auto">
            {filteredBanks.length === 0 ? (
              <div className="px-4 py-3 text-text-muted text-sm">Không tìm thấy ngân hàng</div>
            ) : (
              filteredBanks.map(bank => (
                <button
                  key={bank.bin}
                  type="button"
                  onClick={() => handleSelectBank(bank)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-surface-lighter transition-colors text-left"
                >
                  <img src={bank.logo} alt="" className="w-8 h-8 rounded object-contain bg-white shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text truncate">{bank.shortName}</div>
                    <div className="text-xs text-text-muted truncate">{bank.name}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Account Number */}
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1.5">Số tài khoản</label>
        <input
          type="text"
          inputMode="numeric"
          value={accountNo}
          onChange={(e) => setAccountNo(e.target.value.replace(/\D/g, ''))}
          placeholder="Nhập số tài khoản"
          className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1.5">Nội dung chuyển khoản</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="VD: thanhtoan, chuyentien..."
          className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-border text-text-muted font-medium hover:bg-surface-lighter transition-colors"
          >
            Huỷ
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          Lưu thông tin
        </button>
      </div>
    </form>
  );
}
