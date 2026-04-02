import { useEffect, useId, useRef, useState } from 'react';
import api from '../services/api';
import type { WheelClaim } from '../types';

type Props = {
  onClaimUpdated?: () => void;
};

type VerifyResponse = {
  claim: WheelClaim;
  qr_payload: string;
};

type RedeemResponse = {
  claim: WheelClaim;
};

export default function WheelClaimScanner({ onClaimUpdated }: Props) {
  const scannerElementId = `wheel-claim-scanner-${useId().replace(/[:]/g, '')}`;
  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [shouldStartScanner, setShouldStartScanner] = useState(false);
  const [starting, setStarting] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [claim, setClaim] = useState<WheelClaim | null>(null);
  const [tokenValue, setTokenValue] = useState('');
  const [processing, setProcessing] = useState(false);

  const formatCameraError = (err: unknown) => {
    if (typeof err === 'string') {
      return err;
    }

    if (err && typeof err === 'object') {
      const maybeError = err as { message?: string; name?: string; toString?: () => string };

      if (maybeError.message) {
        return maybeError.message;
      }

      if (maybeError.name) {
        return maybeError.name;
      }

      if (typeof maybeError.toString === 'function') {
        const value = maybeError.toString();
        if (value && value !== '[object Object]') {
          return value;
        }
      }
    }

    return 'Không thể mở camera để quét QR.';
  };

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    setShouldStartScanner(false);

    if (!scanner) {
      setIsScannerOpen(false);
      return;
    }

    try {
      await scanner.stop();
    } catch {
      // ignore stop errors
    }

    try {
      await scanner.clear();
    } catch {
      // ignore clear errors
    }

    setIsScannerOpen(false);
  };

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  useEffect(() => {
    if (!shouldStartScanner || !isScannerOpen || scannerRef.current) {
      return;
    }

    let cancelled = false;

    const startScanner = async () => {
      setStarting(true);

      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) {
          return;
        }

        const scanner = new Html5Qrcode(scannerElementId);
        scannerRef.current = scanner;

        const scanConfig = { fps: 10, qrbox: { width: 240, height: 240 } };
        const onSuccess = (decodedText: string) => {
          if (processing) {
            return;
          }
          void verifyToken(decodedText);
        };

        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          throw new Error('Chrome không tìm thấy camera nào trên thiết bị này.');
        }

        const preferredCamera =
          cameras.find((camera) => /back|rear|environment/gi.test(camera.label)) ||
          cameras[0];

        try {
          await scanner.start(preferredCamera.id, scanConfig, onSuccess, () => {});
        } catch {
          await scanner.start(cameras[0].id, scanConfig, onSuccess, () => {});
        }
      } catch (err: any) {
        setScannerError(
          `${formatCameraError(err)}${
            window.isSecureContext
              ? ''
              : ' Trình duyệt hiện không ở secure context, camera chỉ hoạt động trên HTTPS hoặc localhost.'
          }`
        );
        await stopScanner();
      } finally {
        if (!cancelled) {
          setStarting(false);
          setShouldStartScanner(false);
        }
      }
    };

    void startScanner();

    return () => {
      cancelled = true;
    };
  }, [isScannerOpen, processing, scannerElementId, shouldStartScanner]);

  const verifyToken = async (token: string) => {
    setProcessing(true);
    setScannerError('');

    try {
      const response = await api.post<VerifyResponse>('/admin/wheel-claims/verify', { token });
      setClaim(response.data.claim);
      setTokenValue(token);
      await stopScanner();
    } catch (err: any) {
      setClaim(null);
      setScannerError(err.response?.data?.error || 'Không thể xác minh QR này.');
    } finally {
      setProcessing(false);
    }
  };

  const openScanner = () => {
    setScannerError('');
    setClaim(null);
    setIsScannerOpen(true);
    setShouldStartScanner(true);
  };

  const redeemClaim = async () => {
    if (!tokenValue) {
      return;
    }

    setProcessing(true);
    setScannerError('');

    try {
      const response = await api.post<RedeemResponse>('/admin/wheel-claims/redeem', { token: tokenValue });
      setClaim(response.data.claim);
      onClaimUpdated?.();
    } catch (err: any) {
      const backendClaim = err.response?.data?.claim;
      if (backendClaim) {
        setClaim(backendClaim);
      }
      setScannerError(err.response?.data?.error || 'Không thể xác nhận trao quà.');
    } finally {
      setProcessing(false);
    }
  };

  const handleScanFromImage = async (file: File) => {
    setProcessing(true);
    setScannerError('');
    setClaim(null);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode(scannerElementId);
      const decodedText = await scanner.scanFile(file, false);
      await scanner.clear();
      await verifyToken(decodedText);
    } catch (err: any) {
      setScannerError(err?.message || 'Không thể đọc QR từ ảnh đã chọn.');
    } finally {
      setProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="rounded-[28px] border border-border bg-surface-light p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-light">Scan QR nhận quà</p>
      <h2 className="mt-3 text-2xl font-semibold text-text">Quét mã từ khách hàng để xác thực và trao thưởng</h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-text-muted">
        QR từ phía user có chứa token claim do hệ thống phát hành. Chỉ tài khoản admin đã đăng nhập mới có thể xác minh và đổi trạng thái nhận quà.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={openScanner}
          disabled={starting || processing}
          className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {starting ? 'Đang mở camera...' : 'Mở camera quét QR'}
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={starting || processing}
          className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-text transition hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Quét từ ảnh QR
        </button>
        {isScannerOpen ? (
          <button
            type="button"
            onClick={() => void stopScanner()}
            disabled={processing}
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-text transition hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Dừng camera
          </button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleScanFromImage(file);
          }
        }}
      />

      <p className="mt-4 text-xs leading-6 text-text-muted">
        Trên mobile, camera hoạt động tốt nhất khi mở qua HTTPS hoặc domain production. Trên macOS laptop, nếu webcam bị chặn,
        bạn vẫn có thể dùng nút quét từ ảnh QR.
      </p>

      {!window.isSecureContext ? (
        <p className="mt-3 text-xs font-medium text-amber-300">
          Trình duyệt hiện không ở secure context. Camera của Chrome chỉ hoạt động trên HTTPS hoặc `localhost`.
        </p>
      ) : null}

      {scannerError ? <p className="mt-4 text-sm font-medium text-red-400">{scannerError}</p> : null}

      <div className={`${isScannerOpen ? 'mt-5 rounded-[24px] border border-border bg-surface p-4' : 'h-0 overflow-hidden opacity-0'}`}>
        <div id={scannerElementId} className="overflow-hidden rounded-2xl bg-black" />
      </div>

      {claim ? (
        <div className="mt-5 rounded-[24px] border border-border bg-surface p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-text">{claim.prize_name}</p>
              <p className="mt-1 text-sm leading-6 text-text-muted">{claim.prize_description || 'Không có mô tả.'}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                claim.status === 'redeemed'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-amber-500/10 text-amber-300'
              }`}
            >
              {claim.status === 'redeemed' ? 'Đã trao quà' : 'Chưa nhận quà'}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-surface-light px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Số điện thoại</p>
              <p className="mt-2 text-sm font-semibold text-text">{claim.phone}</p>
            </div>
            <div className="rounded-2xl bg-surface-light px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Mã nhận quà</p>
              <p className="mt-2 text-sm font-semibold text-text">#{claim.id}</p>
            </div>
            <div className="rounded-2xl bg-surface-light px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Phát hành lúc</p>
              <p className="mt-2 text-sm font-semibold text-text">{new Date(claim.issued_at).toLocaleString('vi-VN')}</p>
            </div>
            <div className="rounded-2xl bg-surface-light px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Nhân viên xác nhận</p>
              <p className="mt-2 text-sm font-semibold text-text">
                {claim.redeemed_by_username || (claim.status === 'redeemed' ? 'Đã xác nhận' : 'Chưa xác nhận')}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={redeemClaim}
              disabled={processing || claim.status === 'redeemed'}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? 'Đang xử lý...' : claim.status === 'redeemed' ? 'Đã xác nhận nhận quà' : 'Xác nhận trao quà'}
            </button>
            <button
              type="button"
              onClick={() => {
                setClaim(null);
                setTokenValue('');
                setScannerError('');
              }}
              disabled={processing}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-text transition hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Quét mã khác
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
