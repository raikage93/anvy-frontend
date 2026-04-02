import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LuckyWheelBoard from '../components/LuckyWheelBoard';
import WheelNoticeModal from '../components/WheelNoticeModal';
import WheelPhoneModal from '../components/WheelPhoneModal';
import PublicShell from '../components/PublicShell';
import api from '../services/api';
import type { WheelPrize, WheelSettings, WheelSpin } from '../types';

type SpinResponse = {
  spin: WheelSpin;
  prize: WheelPrize;
  prizes: WheelPrize[];
  max_daily_spins_per_phone: number;
  spins_used_today: number;
  spins_remaining_today: number;
  phone: string;
};

const WHEEL_PHONE_STORAGE_KEY = 'anvy_wheel_phone';

const perks = [
  'Kết quả quay được backend xử lý trực tiếp theo tồn kho thực tế.',
  'Tỉ lệ xuất hiện của mỗi giải thay đổi theo số lượng còn lại.',
  'Frontend chỉ animate đến đúng ô mà hệ thống đã cấp thưởng.',
];

function buildTargetRotation(currentRotation: number, segmentIndex: number, totalSegments: number) {
  const segmentAngle = 360 / totalSegments;
  const targetAngle = (360 - (segmentIndex * segmentAngle + segmentAngle / 2)) % 360;
  const currentNormalized = ((currentRotation % 360) + 360) % 360;
  let delta = targetAngle - currentNormalized;

  if (delta < 0) {
    delta += 360;
  }

  return currentRotation + 6 * 360 + delta;
}

export default function LuckyWheelPage() {
  const [prizes, setPrizes] = useState<WheelPrize[]>([]);
  const [wheelSettings, setWheelSettings] = useState<WheelSettings>({ max_daily_spins_per_phone: 1 });
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SpinResponse | null>(null);
  const [error, setError] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState(() => window.localStorage.getItem(WHEEL_PHONE_STORAGE_KEY) || '');
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [dailyStatus, setDailyStatus] = useState<{ used: number; remaining: number } | null>(null);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    void fetchPrizes();
  }, []);

  const fetchPrizes = async () => {
    setLoading(true);
    try {
      const [prizeResponse, settingsResponse] = await Promise.all([api.get('/wheel/prizes'), api.get('/wheel/settings')]);
      setPrizes(prizeResponse.data);
      setWheelSettings(settingsResponse.data);
    } catch {
      setPrizes([]);
      setWheelSettings({ max_daily_spins_per_phone: 1 });
    } finally {
      setLoading(false);
    }
  };

  const performSpin = async (phone: string) => {
    if (isSpinning || !prizes.length || prizes.every((item) => item.remaining_quantity <= 0)) {
      return;
    }

    setError('');
    setPhoneError('');
    setResult(null);
    setIsSpinning(true);

    try {
      const response = await api.post<SpinResponse>('/wheel/spin', { phone });
      const payload = response.data;

      setVerifiedPhone(payload.phone);
      window.localStorage.setItem(WHEEL_PHONE_STORAGE_KEY, payload.phone);
      setPrizes(payload.prizes);
      setDailyStatus({
        used: payload.spins_used_today,
        remaining: payload.spins_remaining_today,
      });
      setRotation((current) => buildTargetRotation(current, payload.spin.segment_index || 0, payload.prizes.length));

      window.setTimeout(() => {
        setResult(payload);
        setIsSpinning(false);
        setIsPhoneModalOpen(false);
      }, 4700);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Không thể quay thưởng lúc này.';
      setError(message);
      setPhoneError(message);
      setNotice({
        title: 'Không thể quay thưởng',
        message,
      });
      if (typeof err.response?.data?.spins_used_today === 'number' && typeof err.response?.data?.spins_remaining_today === 'number') {
        setDailyStatus({
          used: err.response.data.spins_used_today,
          remaining: err.response.data.spins_remaining_today,
        });
      }
      setIsSpinning(false);
    }
  };

  const handleSpinClick = () => {
    if (!verifiedPhone) {
      setPhoneError('');
      setIsPhoneModalOpen(true);
      return;
    }

    void performSpin(verifiedPhone);
  };

  const handlePhoneSubmit = (phone: string) => {
    const normalizedPhone = phone.trim();
    if (!/^[0-9+()\s.-]{8,20}$/.test(normalizedPhone)) {
      setPhoneError('Vui lòng nhập số điện thoại hợp lệ.');
      return;
    }

    setVerifiedPhone(normalizedPhone);
    window.localStorage.setItem(WHEEL_PHONE_STORAGE_KEY, normalizedPhone);
    setPhoneError('');
    void performSpin(normalizedPhone);
  };

  const canSpin = prizes.some((item) => item.remaining_quantity > 0);

  return (
    <PublicShell active="wheel">
      <section className="overflow-hidden bg-[radial-gradient(circle_at_top,#e0efff_0%,#f8fbff_48%,#ffffff_100%)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <span className="inline-flex rounded-full border border-[#c9dcff] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.26em] text-[#00478d]">
              Lucky Wheel Campaign
            </span>
            <h1 className="mt-6 font-['Manrope'] text-5xl font-extrabold leading-[1.02] tracking-[-0.05em] text-slate-900 sm:text-6xl">
              Vòng quay may mắn với quà tặng dành riêng cho khách hàng của <span className="text-[#005eb8]">AnVy Clinic</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Mỗi lượt quay đều được hệ thống xử lý trực tiếp trên backend theo số lượng quà còn lại. Khi kết quả đã được cấp,
              vòng quay sẽ dừng đúng vào ô giải thưởng tương ứng.
            </p>

            <div className="mt-8 grid gap-3">
              {perks.map((perk) => (
                <div key={perk} className="flex items-start gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-slate-200/80">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d6e3ff] text-xs font-bold text-[#00478d]">
                    ✓
                  </span>
                  <p className="text-sm leading-7 text-slate-700">{perk}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleSpinClick}
                disabled={loading || isSpinning || !canSpin}
                className="rounded-full bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] px-7 py-3.5 text-center font-['Manrope'] text-base font-extrabold text-white shadow-lg shadow-blue-900/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSpinning ? 'Đang quay thưởng...' : 'Bắt đầu quay'}
              </button>
              <Link
                to="/booking"
                className="rounded-full border border-slate-300 bg-white px-7 py-3.5 text-center font-['Manrope'] text-base font-bold text-slate-700 transition hover:border-[#00478d] hover:text-[#00478d]"
              >
                Đặt lịch khám
              </Link>
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white/80 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#005eb8]">Thông tin xác minh</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {verifiedPhone ? `Số điện thoại hiện tại: ${verifiedPhone}` : 'Bạn chưa nhập số điện thoại để quay thưởng.'}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Mỗi số điện thoại được quay tối đa {wheelSettings.max_daily_spins_per_phone} lượt mỗi ngày theo cấu hình hệ thống.
                </p>
                {dailyStatus ? (
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Hôm nay đã dùng {dailyStatus.used} lượt, còn lại {dailyStatus.remaining} lượt.
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  setPhoneError('');
                  setIsPhoneModalOpen(true);
                }}
                className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-[#00478d] hover:text-[#00478d]"
              >
                {verifiedPhone ? 'Đổi số điện thoại' : 'Nhập số điện thoại'}
              </button>
            </div>

            {error ? <p className="mt-5 text-sm font-medium text-red-500">{error}</p> : null}
          </div>

          <div>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#005eb8]/20 border-t-[#005eb8]" />
              </div>
            ) : (
              <LuckyWheelBoard
                prizes={prizes}
                rotation={rotation}
                isSpinning={isSpinning}
                onSpin={handleSpinClick}
                spinDisabled={!canSpin}
                buttonLabel="Quay"
                helperText={
                  canSpin
                    ? verifiedPhone
                      ? 'Nhấn nút ở giữa để quay thưởng bằng số điện thoại đã xác minh.'
                      : 'Nhấn nút ở giữa, nhập số điện thoại xác minh rồi hệ thống mới cho quay.'
                    : 'Hiện tại tất cả phần quà đã được nhận hết. Vui lòng cấu hình lại trong admin.'
                }
              />
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#00478d]">Reward Legend</p>
              <h2 className="mt-3 font-['Manrope'] text-4xl font-extrabold tracking-[-0.03em] text-slate-900">Danh sách giải thưởng hiện có</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-500">
              Các ô có số lượng còn lại bằng 0 vẫn được hiển thị để user biết cấu trúc giải, nhưng backend sẽ không chọn các ô đó khi quay.
            </p>
          </div>

          {prizes.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-[#f7f9fb] px-6 py-12 text-center text-sm text-slate-500">
              Chưa có giải thưởng nào được cấu hình trên hệ thống.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {prizes.map((prize) => (
                <article key={prize.id} className="rounded-[28px] border border-slate-200 bg-[#f7f9fb] p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="h-4 w-4 rounded-full border border-slate-200" style={{ backgroundColor: prize.color }} />
                      <p className="font-['Manrope'] text-xl font-extrabold tracking-tight text-slate-900">{prize.name}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                        prize.remaining_quantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {prize.remaining_quantity > 0 ? 'Còn quà' : 'Đã hết'}
                    </span>
                  </div>
                  <p className="mt-4 min-h-14 text-sm leading-7 text-slate-600">{prize.description || 'Quà tặng đặc biệt từ AnVy Clinic.'}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Tổng số lượng</p>
                      <p className="mt-2 font-['Manrope'] text-lg font-extrabold text-slate-900">{prize.total_quantity}</p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Còn lại</p>
                      <p className="mt-2 font-['Manrope'] text-lg font-extrabold text-slate-900">{prize.remaining_quantity}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {result ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] bg-white p-8 shadow-[0_40px_80px_rgba(15,23,42,0.32)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,#ffe7a8_0%,#ffc857_52%,#ffb100_100%)] text-4xl shadow-lg shadow-amber-400/30">
              🎁
            </div>
            <p className="mt-6 text-center text-xs font-bold uppercase tracking-[0.3em] text-[#005eb8]">Kết quả quay thưởng</p>
            <h3 className="mt-3 text-center font-['Manrope'] text-4xl font-extrabold tracking-[-0.04em] text-slate-900">
              {result.prize.name}
            </h3>
            <p className="mt-4 text-center text-base leading-8 text-slate-600">
              {result.prize.description || 'Chúc mừng bạn đã nhận được phần quà từ AnVy Clinic.'}
            </p>

            <div className="mt-6 rounded-[28px] border border-slate-200 bg-[#f7f9fb] px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">Mã lượt quay</span>
                <span className="font-['Manrope'] text-lg font-extrabold text-slate-900">#{result.spin.id}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">Số lượng còn lại</span>
                <span className="font-['Manrope'] text-lg font-extrabold text-slate-900">{result.prize.remaining_quantity}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">Số điện thoại xác minh</span>
                <span className="font-['Manrope'] text-lg font-extrabold text-slate-900">{result.phone}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="flex-1 rounded-full bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] px-6 py-3 text-center font-['Manrope'] text-base font-extrabold text-white transition hover:opacity-95"
              >
                Đóng thông báo
              </button>
              <Link
                to="/booking"
                className="flex-1 rounded-full border border-slate-300 bg-white px-6 py-3 text-center font-['Manrope'] text-base font-bold text-slate-700 transition hover:border-[#00478d] hover:text-[#00478d]"
              >
                Đặt lịch ngay
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <WheelPhoneModal
        open={isPhoneModalOpen}
        initialPhone={verifiedPhone}
        loading={isSpinning}
        error={phoneError}
        onClose={() => {
          if (!isSpinning) {
            setIsPhoneModalOpen(false);
            setPhoneError('');
          }
        }}
        onSubmit={handlePhoneSubmit}
      />

      <WheelNoticeModal
        open={Boolean(notice)}
        title={notice?.title || ''}
        message={notice?.message || ''}
        onClose={() => setNotice(null)}
      />
    </PublicShell>
  );
}
