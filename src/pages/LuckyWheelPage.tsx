import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import WheelClaimQrCard from '../components/WheelClaimQrCard';
import LuckyWheelBoard from '../components/LuckyWheelBoard';
import WheelNoticeModal from '../components/WheelNoticeModal';
import WheelPhoneModal from '../components/WheelPhoneModal';
import PublicShell from '../components/PublicShell';
import api from '../services/api';
import type { WheelClaim, WheelPrize, WheelRecentWinner, WheelReward, WheelSettings, WheelSpin } from '../types';

type SpinResponse = {
  spin: WheelSpin;
  prize: WheelPrize;
  prizes: WheelPrize[];
  max_daily_spins_per_phone: number;
  spins_used_today: number;
  spins_remaining_today: number;
  phone: string;
};

type ClaimResponse = {
  claim: WheelClaim;
};

const WHEEL_PHONE_STORAGE_KEY = 'anvy_wheel_phone';
const SPIN_DURATION_MS = 10000;

function buildTargetRotation(currentRotation: number, segmentIndex: number, totalSegments: number) {
  const segmentAngle = 360 / totalSegments;
  const centerAngle = segmentIndex * segmentAngle + segmentAngle / 2;
  const edgePadding = Math.min(segmentAngle * 0.22, 10);
  const randomRange = Math.max(segmentAngle / 2 - edgePadding, 0);
  const randomOffset = randomRange > 0 ? (Math.random() * 2 - 1) * randomRange : 0;
  const targetAngle = (360 - (centerAngle + randomOffset)) % 360;
  const currentNormalized = ((currentRotation % 360) + 360) % 360;
  let delta = targetAngle - currentNormalized;

  if (delta < 0) {
    delta += 360;
  }

  return currentRotation + 8 * 360 + delta;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isValidPhone(phone: string) {
  return /^[0-9+()\s.-]{8,20}$/.test(phone.trim());
}

export default function LuckyWheelPage() {
  const wheelSectionRef = useRef<HTMLDivElement | null>(null);
  const [prizes, setPrizes] = useState<WheelPrize[]>([]);
  const [wheelSettings, setWheelSettings] = useState<WheelSettings>({ max_daily_spins_per_phone: 1 });
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [recentWinners, setRecentWinners] = useState<WheelRecentWinner[]>([]);
  const [myRewards, setMyRewards] = useState<WheelReward[]>([]);
  const [result, setResult] = useState<SpinResponse | null>(null);
  const [claimPreview, setClaimPreview] = useState<WheelClaim | null>(null);
  const [claimingSpinId, setClaimingSpinId] = useState<number | null>(null);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState(() => window.localStorage.getItem(WHEEL_PHONE_STORAGE_KEY) || '');
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [dailyStatus, setDailyStatus] = useState<{ used: number; remaining: number } | null>(null);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    void fetchInitialData();
  }, []);

  useEffect(() => {
    if (verifiedPhone && isValidPhone(verifiedPhone)) {
      void fetchMyRewards(verifiedPhone);
      return;
    }

    setMyRewards([]);
  }, [verifiedPhone]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prizeResponse, settingsResponse, winnersResponse] = await Promise.all([
        api.get('/wheel/prizes'),
        api.get('/wheel/settings'),
        api.get('/wheel/recent-winners'),
      ]);
      setPrizes(prizeResponse.data);
      setWheelSettings(settingsResponse.data);
      setRecentWinners(winnersResponse.data);
    } catch {
      setPrizes([]);
      setWheelSettings({ max_daily_spins_per_phone: 1 });
      setRecentWinners([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentWinners = async () => {
    try {
      const response = await api.get('/wheel/recent-winners');
      setRecentWinners(response.data);
    } catch {
      setRecentWinners([]);
    }
  };

  const fetchMyRewards = async (phone: string) => {
    if (!isValidPhone(phone)) {
      setMyRewards([]);
      return;
    }

    try {
      const response = await api.get('/wheel/my-rewards', {
        params: { phone },
      });
      setMyRewards(response.data);
    } catch {
      setMyRewards([]);
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
        void fetchMyRewards(payload.phone);
      }, SPIN_DURATION_MS + 120);
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

  const claimPrize = async (spinId: number) => {
    if (!verifiedPhone || !isValidPhone(verifiedPhone)) {
      setPhoneError('Vui lòng nhập số điện thoại trước khi nhận giải.');
      setIsPhoneModalOpen(true);
      return;
    }

    setClaimingSpinId(spinId);

    try {
      const response = await api.post<ClaimResponse>('/wheel/claim', {
        phone: verifiedPhone,
        spin_id: spinId,
      });

      setClaimPreview(response.data.claim);
      setResult(null);
      setIsRewardsModalOpen(false);
      await fetchMyRewards(verifiedPhone);
      await fetchRecentWinners();
    } catch (err: any) {
      const message = err.response?.data?.error || 'Không thể nhận giải lúc này.';
      const existingClaim = err.response?.data?.claim;

      if (existingClaim) {
        setClaimPreview(existingClaim);
      }

      setNotice({
        title: 'Không thể nhận giải',
        message,
      });
    } finally {
      setClaimingSpinId(null);
    }
  };

  const scrollToWheelOnMobile = async () => {
    if (window.innerWidth >= 768 || !wheelSectionRef.current) {
      return;
    }

    const rect = wheelSectionRef.current.getBoundingClientRect();
    const centerY = window.innerHeight / 2;
    const wheelCenterY = rect.top + rect.height / 2;
    const alreadyCentered = Math.abs(wheelCenterY - centerY) <= 56;

    if (alreadyCentered) {
      return;
    }

    const targetTop = Math.max(window.scrollY + rect.top - (window.innerHeight / 2 - rect.height / 2), 0);

    window.scrollTo({
      behavior: 'smooth',
      top: targetTop,
    });

    await wait(460);
  };

  const closePhoneModalAndFocusWheel = async () => {
    setIsPhoneModalOpen(false);

    await wait(60);
    await scrollToWheelOnMobile();
  };

  const handleSpinClick = () => {
    void (async () => {
      await scrollToWheelOnMobile();

      if (!verifiedPhone) {
        setPhoneError('');
        setIsPhoneModalOpen(true);
        return;
      }

      await performSpin(verifiedPhone);
    })();
  };

  const handlePhoneSubmit = (phone: string) => {
    const normalizedPhone = phone.trim();
    if (!isValidPhone(normalizedPhone)) {
      setPhoneError('Vui lòng nhập số điện thoại hợp lệ.');
      return;
    }

    setVerifiedPhone(normalizedPhone);
    window.localStorage.setItem(WHEEL_PHONE_STORAGE_KEY, normalizedPhone);
    setPhoneError('');
    void fetchMyRewards(normalizedPhone);
    void (async () => {
      await closePhoneModalAndFocusWheel();
      await performSpin(normalizedPhone);
    })();
  };

  const handleOpenClaimCenter = () => {
    if (!verifiedPhone || !isValidPhone(verifiedPhone)) {
      setPhoneError('');
      setIsPhoneModalOpen(true);
      return;
    }

    const claimedReward = myRewards.find((reward) => reward.claim);
    if (claimedReward?.claim) {
      setClaimPreview(claimedReward.claim);
      return;
    }

    setIsRewardsModalOpen(true);
  };

  const canSpin = prizes.some((item) => item.remaining_quantity > 0);
  const hasAnyRewardToday = myRewards.length > 0;
  const claimedRewardToday = myRewards.find((reward) => reward.claim);
  const unclaimedRewardsToday = myRewards.filter((reward) => !reward.claim);

  return (
    <PublicShell active="wheel">
      <section className="overflow-hidden bg-[radial-gradient(circle_at_top,#e0efff_0%,#f8fbff_48%,#ffffff_100%)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:px-8 lg:py-20">
          <div>
            <span className="inline-flex rounded-full border border-[#c9dcff] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.26em] text-[#00478d]">
              Lucky Wheel Campaign
            </span>
            <h1 className="mt-6 font-['Manrope'] text-5xl font-extrabold leading-[1.02] tracking-[-0.05em] text-slate-900 sm:text-6xl">
              Vòng quay may mắn với quà tặng dành riêng cho khách hàng của <span className="text-[#005eb8]">AnVy Clinic</span>
            </h1>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleSpinClick}
                disabled={loading || isSpinning || !canSpin}
                className="rounded-full bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] px-7 py-3.5 text-center font-['Manrope'] text-base font-extrabold text-white shadow-lg shadow-blue-900/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSpinning ? 'Đang quay thưởng...' : 'Bắt đầu quay'}
              </button>
              {hasAnyRewardToday ? (
                <button
                  type="button"
                  onClick={handleOpenClaimCenter}
                  className="rounded-full border border-[#005eb8] bg-white px-7 py-3.5 text-center font-['Manrope'] text-base font-bold text-[#005eb8] transition hover:bg-[#eff6ff]"
                >
                  {claimedRewardToday ? 'Xem mã nhận giải' : 'Nhận giải'}
                </button>
              ) : null}
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
                {claimedRewardToday ? (
                  <p className="mt-1 text-sm leading-6 text-emerald-600">
                    Hôm nay bạn đã nhận 1 giải. Bạn vẫn có thể xem lại mã QR để admin quét khi nhận quà.
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

          <div ref={wheelSectionRef} className="lg:sticky lg:top-24 lg:self-start">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#005eb8]/20 border-t-[#005eb8]" />
              </div>
            ) : (
              <LuckyWheelBoard
                prizes={prizes}
                rotation={rotation}
                isSpinning={isSpinning}
                spinDurationMs={SPIN_DURATION_MS}
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
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#00478d]">Recent Winners</p>
              <h2 className="mt-3 font-['Manrope'] text-4xl font-extrabold tracking-[-0.03em] text-slate-900">Khách hàng nhận quà gần đây</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-500">
              Chỉ hiển thị những lượt đã được admin xác nhận trao quà. Số điện thoại được ẩn ở phần giữa để bảo vệ thông tin khách hàng.
            </p>
          </div>

          {recentWinners.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-[#f7f9fb] px-6 py-12 text-center text-sm text-slate-500">
              Chưa có khách hàng nào được xác nhận nhận quà gần đây.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {recentWinners.map((winner) => (
                <article key={winner.id} className="rounded-[28px] border border-slate-200 bg-[#f7f9fb] p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <span className="mt-1 h-4 w-4 shrink-0 rounded-full border border-slate-200" style={{ backgroundColor: winner.prize_color }} />
                    <div className="min-w-0">
                      <p className="font-['Manrope'] text-xl font-extrabold tracking-tight text-slate-900">{winner.prize_name}</p>
                      <p className="mt-2 text-base font-semibold text-slate-700">{winner.phone}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-500">
                        Đã nhận quà lúc {new Date(winner.redeemed_at).toLocaleString('vi-VN')}
                      </p>
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
          <div className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[32px] bg-white p-6 shadow-[0_40px_80px_rgba(15,23,42,0.32)] sm:p-7">
            <button
              type="button"
              onClick={() => setResult(null)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Đóng thông báo"
            >
              ×
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,#ffe7a8_0%,#ffc857_52%,#ffb100_100%)] text-3xl shadow-lg shadow-amber-400/30">
              🎁
            </div>
            <p className="mt-5 text-center text-xs font-bold uppercase tracking-[0.3em] text-[#005eb8]">Kết quả quay thưởng</p>
            <h3 className="mt-3 text-center font-['Manrope'] text-3xl font-extrabold tracking-[-0.04em] text-slate-900">
              {result.prize.name}
            </h3>
            <p className="mt-3 text-center text-sm leading-7 text-slate-600">
              Bạn có thể nhận giải này ngay bây giờ hoặc tiếp tục quay rồi chọn một giải để nhận sau. Mỗi ngày chỉ được claim 1 giải.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => void claimPrize(result.spin.id)}
                disabled={claimingSpinId === result.spin.id}
                className="w-full rounded-full bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] px-6 py-3 text-center font-['Manrope'] text-base font-extrabold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {claimingSpinId === result.spin.id ? 'Đang tạo mã nhận giải...' : 'Claim giải này'}
              </button>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="w-full rounded-full border border-slate-300 bg-white px-6 py-3 text-center font-['Manrope'] text-base font-bold text-slate-700 transition hover:border-[#00478d] hover:text-[#00478d]"
              >
                Tiếp tục quay
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isRewardsModalOpen ? (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/65 px-4 py-8 backdrop-blur-sm">
          <div className="relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-[0_40px_80px_rgba(15,23,42,0.32)] sm:p-7">
            <button
              type="button"
              onClick={() => setIsRewardsModalOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Đóng danh sách nhận giải"
            >
              ×
            </button>

            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#005eb8]">Nhận giải hôm nay</p>
            <h3 className="mt-3 font-['Manrope'] text-3xl font-extrabold tracking-[-0.04em] text-slate-900">
              Chọn một giải để claim
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Bạn chỉ có thể claim một giải trong ngày. Sau khi claim thành công, hệ thống sẽ tạo mã QR để admin quét khi trao quà.
            </p>

            <div className="mt-6 grid gap-4">
              {myRewards.map((reward) => (
                <article key={reward.id} className="rounded-[24px] border border-slate-200 bg-[#f7f9fb] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="h-4 w-4 shrink-0 rounded-full border border-slate-200" style={{ backgroundColor: reward.prize_color }} />
                        <p className="font-['Manrope'] text-xl font-extrabold tracking-tight text-slate-900">{reward.prize_name}</p>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-500">
                        Quay lúc {new Date(reward.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>

                    {reward.claim ? (
                      <button
                        type="button"
                        onClick={() => setClaimPreview(reward.claim || null)}
                        className="rounded-full border border-[#005eb8] bg-white px-5 py-2.5 text-sm font-bold text-[#005eb8] transition hover:bg-[#eff6ff]"
                      >
                        Xem mã QR
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void claimPrize(reward.id)}
                        disabled={claimingSpinId === reward.id || Boolean(claimedRewardToday)}
                        className="rounded-full bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {claimingSpinId === reward.id
                          ? 'Đang tạo QR...'
                          : claimedRewardToday
                            ? 'Đã đủ 1 giải/ngày'
                            : 'Claim giải này'}
                      </button>
                    )}
                  </div>
                </article>
              ))}

              {myRewards.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-[#f7f9fb] px-6 py-10 text-center text-sm text-slate-500">
                  Hôm nay bạn chưa quay được giải nào để claim.
                </div>
              ) : null}
            </div>

            {unclaimedRewardsToday.length > 0 && !claimedRewardToday ? (
              <p className="mt-5 text-sm leading-7 text-slate-500">
                Bạn đang có {unclaimedRewardsToday.length} giải chưa claim trong hôm nay. Hãy chọn một giải để hệ thống tạo QR nhận quà.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {claimPreview ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/65 px-4 py-8 backdrop-blur-sm">
          <div className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[32px] bg-white p-6 shadow-[0_40px_80px_rgba(15,23,42,0.32)] sm:p-7">
            <button
              type="button"
              onClick={() => setClaimPreview(null)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Đóng mã nhận giải"
            >
              ×
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,#d9f8ff_0%,#7dd3fc_52%,#38bdf8_100%)] text-3xl shadow-lg shadow-sky-300/30">
              ✓
            </div>
            <p className="mt-5 text-center text-xs font-bold uppercase tracking-[0.3em] text-[#005eb8]">Mã nhận giải</p>
            <h3 className="mt-3 text-center font-['Manrope'] text-3xl font-extrabold tracking-[-0.04em] text-slate-900">
              {claimPreview.prize_name}
            </h3>
            <p className="mt-3 text-center text-sm leading-7 text-slate-600">
              Lưu mã QR này và đưa cho admin quét khi bạn đến nhận quà tại phòng khám.
            </p>

            <div className="mt-5">
              <WheelClaimQrCard claim={claimPreview} />
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
