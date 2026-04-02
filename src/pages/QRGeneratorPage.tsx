import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { generateQRUrl } from '../services/vietqr';
import AmountInput from '../components/AmountInput';
import QRDisplay from '../components/QRDisplay';
import BrandMark from '../components/BrandMark';
import api from '../services/api';
import type { DefaultInfo } from '../types';

export default function QRGeneratorPage() {
  const { user } = useAuth();
  const [defaultInfo, setDefaultInfo] = useState<DefaultInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState('');
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    api.get('/default-account')
      .then(res => {
        if (res.data) {
          setDefaultInfo({
            bankBin: res.data.bank_bin,
            bankName: res.data.bank_name,
            bankLogo: res.data.bank_logo,
            accountNo: res.data.account_no,
            description: res.data.description,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = (amt: number) => {
    if (!defaultInfo) return;
    setAmount(amt);
    setQrUrl(generateQRUrl(defaultInfo.bankBin, defaultInfo.accountNo, amt, defaultInfo.description));
  };

  const handleBack = () => {
    setQrUrl('');
    setAmount(0);
  };

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-lg mx-auto flex flex-col gap-3 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:py-2">
          <div className="flex items-center gap-2.5">
            <BrandMark size="sm" darkBg />
            <div>
              <span className="font-bold text-text">Thanh toán</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/" className="text-sm text-text-muted hover:text-primary transition-colors">
              Trang chủ
            </Link>
            {user?.role === 'admin' ? (
              <Link to="/admin" className="text-sm text-text-muted hover:text-primary transition-colors">
                ⚙ Admin
              </Link>
            ) : (
              <Link to="/login" className="text-sm text-text-muted hover:text-primary transition-colors">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <div className="max-w-lg mx-auto w-full px-4 py-6 flex-1">
          {loading && (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {!loading && !defaultInfo && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-surface-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-text mb-2">Chưa thiết lập tài khoản</h2>
              <p className="text-text-muted text-sm">Vui lòng liên hệ admin để thiết lập thông tin tài khoản nhận tiền.</p>
            </div>
          )}

          {!loading && defaultInfo && !qrUrl && (
            <div className="space-y-5">
              {/* Account info */}
              <div className="flex items-center gap-3 p-3.5 bg-surface-light rounded-xl border border-border">
                <img src={defaultInfo.bankLogo} alt="" className="w-9 h-9 rounded-lg object-contain bg-white" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-text text-sm">{defaultInfo.bankName}</div>
                  <div className="text-xs text-text-muted">STK: {defaultInfo.accountNo}</div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                  Sẵn sàng
                </span>
              </div>
              <AmountInput onGenerate={handleGenerate} />
            </div>
          )}

          {!loading && defaultInfo && qrUrl && (
            <QRDisplay qrUrl={qrUrl} amount={amount} info={defaultInfo} onBack={handleBack} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-text-muted border-t border-border/30">
        AnVy Payment &middot; Powered by VietQR
      </footer>
    </div>
  );
}
