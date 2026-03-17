import { useState } from 'react';
import { useDefaultInfo } from '../hooks/useDefaultInfo';
import { generateQRUrl } from '../services/vietqr';
import DefaultInfoForm from '../components/DefaultInfoForm';
import AmountInput from '../components/AmountInput';
import QRDisplay from '../components/QRDisplay';
import type { DefaultInfo } from '../types';

type View = 'loading' | 'setup' | 'amount' | 'qr';

export default function QRGeneratorPage() {
  const { defaultInfo, isLoaded, saveInfo } = useDefaultInfo();
  const [editing, setEditing] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [amount, setAmount] = useState(0);

  const getView = (): View => {
    if (!isLoaded) return 'loading';
    if (!defaultInfo || editing) return 'setup';
    if (qrUrl) return 'qr';
    return 'amount';
  };

  const handleSave = (info: DefaultInfo) => {
    saveInfo(info);
    setEditing(false);
  };

  const handleGenerate = (amt: number) => {
    if (!defaultInfo) return;
    setAmount(amt);
    setQrUrl(generateQRUrl(defaultInfo.bankBin, defaultInfo.accountNo, amt, defaultInfo.description));
  };

  const handleBack = () => {
    setQrUrl('');
    setAmount(0);
  };

  const view = getView();

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="font-bold text-text">AnVy QR</span>
          </div>

          {defaultInfo && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Cài đặt
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="max-w-lg mx-auto w-full px-4 py-6 flex-1">
          {view === 'loading' && (
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {view === 'setup' && (
            <DefaultInfoForm
              initialData={defaultInfo}
              onSave={handleSave}
              onCancel={editing && defaultInfo ? () => setEditing(false) : undefined}
            />
          )}

          {view === 'amount' && defaultInfo && (
            <div className="space-y-5">
              {/* Current account info */}
              <div className="flex items-center gap-3 p-3.5 bg-surface-light rounded-xl border border-border">
                <img src={defaultInfo.bankLogo} alt="" className="w-9 h-9 rounded-lg object-contain bg-white" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-text text-sm">{defaultInfo.bankName}</div>
                  <div className="text-xs text-text-muted">STK: {defaultInfo.accountNo}</div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                  Đã lưu
                </span>
              </div>

              <AmountInput onGenerate={handleGenerate} />
            </div>
          )}

          {view === 'qr' && defaultInfo && (
            <QRDisplay
              qrUrl={qrUrl}
              amount={amount}
              info={defaultInfo}
              onBack={handleBack}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-text-muted border-t border-border/30">
        AnVy QR &middot; Powered by VietQR
      </footer>
    </div>
  );
}
