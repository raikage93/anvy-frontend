import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import api from '../services/api';
import type { AvailabilitySetting } from '../types';

dayjs.extend(customParseFormat);
dayjs.locale('vi');

type Props = {
  isOpen: boolean;
  onClose: () => void;
  availability: AvailabilitySetting[];
};

type AvailableDateOption = {
  value: string;
  label: string;
  setting: AvailabilitySetting;
};

function getNextSelectableTime(dateValue: string, setting: AvailabilitySetting) {
  if (!setting.start_time || !setting.end_time) return null;

  const now = dayjs();
  const start = dayjs(`${dateValue} ${setting.start_time}`, 'YYYY-MM-DD HH:mm');
  const end = dayjs(`${dateValue} ${setting.end_time}`, 'YYYY-MM-DD HH:mm');

  if (!start.isSame(now, 'day')) {
    return start;
  }

  const nextSlot = now.add(15, 'minute').startOf('minute');
  const roundedMinutes = Math.ceil(nextSlot.minute() / 30) * 30;
  const candidate = nextSlot
    .minute(roundedMinutes === 60 ? 0 : roundedMinutes)
    .second(0)
    .millisecond(0)
    .add(roundedMinutes === 60 ? 1 : 0, 'hour');

  if (candidate.isAfter(end)) {
    return null;
  }

  return candidate.isBefore(start) ? start : candidate;
}

function buildAvailableDateOptions(settings: AvailabilitySetting[], daysAhead = 7): AvailableDateOption[] {
  const today = dayjs().startOf('day');

  return Array.from({ length: daysAhead }, (_, index) => {
    const date = today.add(index, 'day');
    const setting = settings.find((item) => item.weekday === date.day() && item.enabled);

    if (!setting || !getNextSelectableTime(date.format('YYYY-MM-DD'), setting)) return null;

    return {
      value: date.format('YYYY-MM-DD'),
      label: index === 0 ? `Hôm nay · ${setting.label}` : date.format('ddd, DD/MM'),
      setting,
    };
  }).filter(Boolean) as AvailableDateOption[];
}

function buildTimeSlots(dateValue: string, setting: AvailabilitySetting, stepMinutes = 30) {
  const firstSlot = getNextSelectableTime(dateValue, setting);

  if (!firstSlot || !setting.end_time) {
    return [];
  }

  const end = dayjs(`${dateValue} ${setting.end_time}`, 'YYYY-MM-DD HH:mm');
  const slots: string[] = [];
  let cursor = firstSlot;

  while (cursor.isBefore(end) || cursor.isSame(end)) {
    slots.push(cursor.format('HH:mm'));
    cursor = cursor.add(stepMinutes, 'minute');
  }

  return slots;
}

export default function BookingModal({ isOpen, onClose, availability }: Props) {
  const [phone, setPhone] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const enabledAvailability = useMemo(
    () => availability.filter((item) => item.enabled && item.start_time && item.end_time),
    [availability]
  );
  const availableDateOptions = useMemo(
    () => buildAvailableDateOptions(enabledAvailability),
    [enabledAvailability]
  );
  const selectedAvailability = useMemo(
    () => availableDateOptions.find((item) => item.value === appointmentDate)?.setting ?? null,
    [appointmentDate, availableDateOptions]
  );
  const availableTimeSlots = useMemo(
    () => (appointmentDate && selectedAvailability ? buildTimeSlots(appointmentDate, selectedAvailability) : []),
    [appointmentDate, selectedAvailability]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setPhone('');
      setAppointmentDate('');
      setAppointmentTime('');
      setNotes('');
      setLoading(false);
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !availableDateOptions.length) return;

    const nextAvailable = availableDateOptions[0];
    setAppointmentDate((current) => current || nextAvailable.value);
  }, [availableDateOptions, isOpen]);

  useEffect(() => {
    if (!appointmentDate || !selectedAvailability) return;

    const slots = buildTimeSlots(appointmentDate, selectedAvailability);
    setAppointmentTime((current) => (current && slots.includes(current) ? current : slots[0] || ''));
  }, [appointmentDate, selectedAvailability]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!appointmentDate || !selectedAvailability) {
        setError('Hiện chưa có ngày khám khả dụng.');
        setLoading(false);
        return;
      }

      if (!appointmentTime) {
        setError('Vui lòng chọn giờ khám.');
        setLoading(false);
        return;
      }

      const fullDateTime = dayjs(`${appointmentDate} ${appointmentTime}`, 'YYYY-MM-DD HH:mm');

      if (!fullDateTime.isValid()) {
        setError('Thời gian khám không hợp lệ.');
        setLoading(false);
        return;
      }

      if (fullDateTime.isBefore(dayjs())) {
        setError('Vui lòng chọn một thời điểm trong tương lai.');
        setLoading(false);
        return;
      }

      await api.post('/appointments', {
        phone,
        appointment_time: fullDateTime.toISOString(),
        notes,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể gửi lịch hẹn lúc này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/75 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <div className="absolute inset-0" onClick={() => !loading && onClose()} />
      <div className="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-[28px] border border-white/10 bg-surface shadow-2xl shadow-cyan-950/30 sm:max-h-[min(760px,calc(100dvh-3rem))]">
        <div className="border-b border-white/10 bg-linear-to-r from-cyan-500/10 via-transparent to-primary/10 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-light">Đặt lịch khám</p>
              <h2 className="mt-2 text-xl font-semibold text-text sm:text-2xl">Chọn ngày và giờ trong lịch mở</h2>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                Phòng khám chỉ cho phép chọn những ngày và khung giờ đã được admin mở trước.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-text-muted transition hover:border-white/25 hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
            >
              Đóng
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          {success ? (
            <div className="space-y-5">
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Thành công</p>
                <h3 className="mt-2 text-xl font-semibold text-text">Yêu cầu đặt lịch đã được ghi nhận</h3>
                <p className="mt-3 text-sm leading-6 text-text-muted">
                  Phòng khám sẽ liên hệ xác nhận qua số điện thoại bạn đã để lại trong thời gian sớm nhất.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    const nextAvailable = availableDateOptions[0];
                    setSuccess(false);
                    setPhone('');
                    setAppointmentDate(nextAvailable?.value || '');
                    setAppointmentTime(
                      nextAvailable ? buildTimeSlots(nextAvailable.value, nextAvailable.setting)[0] || '' : ''
                    );
                    setNotes('');
                  }}
                  className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-text transition hover:border-white/25"
                >
                  Đặt lịch khác
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl bg-linear-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:opacity-95"
                >
                  Xong
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="booking-phone" className="mb-2 block text-sm font-medium text-text">
                  Số điện thoại
                </label>
                <input
                  id="booking-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Nhập số điện thoại để phòng khám liên hệ"
                  className="w-full rounded-2xl border border-white/10 bg-surface-light px-4 py-3 text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text">Ngày khám khả dụng</label>
                {availableDateOptions.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-surface-light px-4 py-3 text-sm text-text-muted">
                    Hiện chưa có lịch khám khả dụng. Vui lòng liên hệ phòng khám để được hỗ trợ.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {availableDateOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setAppointmentDate(option.value)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                          appointmentDate === option.value
                            ? 'border-cyan-300/40 bg-cyan-300/10 text-white'
                            : 'border-white/10 bg-surface-light text-text-muted hover:border-white/20 hover:text-text'
                        }`}
                      >
                        <span className="block font-medium">{option.label}</span>
                        <span className="mt-1 block text-xs opacity-80">
                          {option.setting.start_time} - {option.setting.end_time}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text">Giờ khám mong muốn</label>
                {availableTimeSlots.length === 0 ? (
                  <div className="rounded-[24px] border border-white/10 bg-surface-light px-4 py-3 text-sm text-text-muted">
                    Không còn giờ khám phù hợp trong ngày này. Vui lòng chọn ngày khác.
                  </div>
                ) : (
                  <div className="rounded-[28px] border border-cyan-400/15 bg-linear-to-br from-cyan-400/10 via-slate-900/70 to-slate-950/90 p-4 shadow-lg shadow-cyan-950/20">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Chọn khung giờ</p>
                        <p className="mt-1 text-sm text-slate-300">Các mốc giờ bên dưới đã được lọc theo lịch admin.</p>
                      </div>
                      {appointmentTime && (
                        <div className="rounded-full border border-cyan-300/20 bg-cyan-300/12 px-3 py-1.5 text-sm font-semibold text-cyan-100">
                          {appointmentTime}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {availableTimeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setAppointmentTime(slot)}
                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                            appointmentTime === slot
                              ? 'border-cyan-300/50 bg-cyan-300/18 text-cyan-50 shadow-lg shadow-cyan-950/25'
                              : 'border-white/10 bg-slate-950/55 text-slate-200 hover:border-cyan-300/25 hover:bg-slate-900/80'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="booking-notes" className="mb-2 block text-sm font-medium text-text">
                  Ghi chú
                </label>
                <textarea
                  id="booking-notes"
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Mô tả ngắn triệu chứng, nhu cầu thăm khám hoặc yêu cầu đặc biệt"
                  className="w-full rounded-2xl border border-white/10 bg-surface-light px-4 py-3 text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !availableDateOptions.length}
                className="w-full rounded-2xl bg-linear-to-r from-primary to-accent px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu đặt lịch'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
