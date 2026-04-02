import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { WheelClaim } from '../types';

type Props = {
  claim: WheelClaim;
};

export default function WheelClaimQrCard({ claim }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let mounted = true;

    void QRCode.toDataURL(claim.qr_payload || '', {
      width: 320,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    }).then((dataUrl: string) => {
      if (mounted) {
        setQrDataUrl(dataUrl);
      }
    });

    return () => {
      mounted = false;
    };
  }, [claim.qr_payload]);

  const downloadQr = () => {
    if (!qrDataUrl) {
      return;
    }

    const anchor = document.createElement('a');
    anchor.href = qrDataUrl;
    anchor.download = `anvy-claim-${claim.id}.png`;
    anchor.click();
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-[#f7f9fb] p-4">
      <div className="flex flex-col items-center gap-4 rounded-[24px] bg-white p-4 shadow-sm">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt={`QR nhận quà #${claim.id}`} className="h-52 w-52 rounded-2xl border border-slate-200 bg-white p-2" />
        ) : (
          <div className="flex h-52 w-52 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-400">
            Đang tạo QR...
          </div>
        )}

        <div className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-center">
          <p className="text-sm leading-6 text-slate-600">
            Lưu QR này và đưa cho admin quét khi nhận quà.
          </p>
        </div>

        <button
          type="button"
          onClick={downloadQr}
          disabled={!qrDataUrl}
          className="w-full rounded-full bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] px-5 py-3 text-center font-['Manrope'] text-sm font-extrabold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Tải QR về máy
        </button>
      </div>
    </div>
  );
}
