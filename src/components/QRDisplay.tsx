import { useState } from 'react';
import { formatVND } from '../utils/format';
import type { DefaultInfo } from '../types';

interface Props {
  qrUrl: string;
  amount: number;
  info: DefaultInfo;
  onBack: () => void;
}

export default function QRDisplay({ qrUrl, amount, info, onBack }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_${info.bankName}_${formatVND(amount)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(qrUrl, '_blank');
    }
  };

  const handleShare = async () => {
    const text = `Chuyển khoản ${formatVND(amount)} VNĐ\nNgân hàng: ${info.bankName}\nSTK: ${info.accountNo}\nNội dung: ${info.description}`;

    if (navigator.share) {
      try {
        const res = await fetch(qrUrl);
        const blob = await res.blob();
        const file = new File([blob], 'qr.png', { type: 'image/png' });
        await navigator.share({ text, files: [file] });
      } catch {
        await navigator.share({ text });
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-5">
      {/* QR Card */}
      <div className="bg-white rounded-2xl p-5 shadow-lg">
        {/* Bank info header */}
        <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-3">
          <img src={info.bankLogo} alt="" className="w-10 h-10 rounded-lg object-contain" />
          <div className="min-w-0">
            <div className="truncate font-semibold text-gray-900">{info.bankName}</div>
            <div className="truncate text-sm text-gray-500">STK: {info.accountNo}</div>
          </div>
        </div>

        {/* QR Image */}
        <div className="relative flex justify-center min-h-[280px] items-center">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          {imgError ? (
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm">Không thể tải mã QR</p>
            </div>
          ) : (
            <img
              src={qrUrl}
              alt="QR Code"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`max-w-full h-auto transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
        </div>

        {/* Amount */}
        <div className="text-center mt-4 pt-3 border-t border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Số tiền</div>
          <div className="text-2xl font-bold text-primary">{formatVND(amount)} VNĐ</div>
          {info.description && (
            <div className="text-sm text-gray-400 mt-1">Nội dung: {info.description}</div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-light border border-border text-text font-medium hover:bg-surface-lighter transition-all active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Tải ảnh
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-all active:scale-[0.98]"
        >
          {copied ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Đã copy
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              Chia sẻ
            </>
          )}
        </button>
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="w-full py-3 rounded-xl border border-border text-text-muted font-medium hover:bg-surface-lighter transition-colors"
      >
        ← Tạo QR mới
      </button>
    </div>
  );
}
