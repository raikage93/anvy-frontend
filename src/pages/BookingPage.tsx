import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import PublicShell from '../components/PublicShell';
import api from '../services/api';
import type { AvailabilitySetting } from '../types';

dayjs.extend(customParseFormat);

type AvailableDateOption = {
  value: string;
  label: string;
  setting: AvailabilitySetting;
};

const services = [
  { id: 'exam', title: 'Đo mắt', subtitle: '30 - 45 phút' },
  { id: 'glasses', title: 'Cắt kính', subtitle: 'Chọn gọng & tròng' },
  { id: 'consulting', title: 'Tư vấn', subtitle: 'Giải đáp thị lực' },
];

const branches = [
  'AnVy Clinic - Quận 1, TP.HCM',
  'AnVy Clinic - Thảo Điền, TP.HCM',
  'AnVy Clinic - Hoàn Kiếm, Hà Nội',
];

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

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState(services[0].id);
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);
  const [availability, setAvailability] = useState<AvailabilitySetting[]>([]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.get('/availability');
        setAvailability(res.data);
      } catch {
        setAvailability([]);
      }
    };

    fetchAvailability();
  }, []);

  const enabledAvailability = useMemo(
    () => availability.filter((item) => item.enabled && item.start_time && item.end_time),
    [availability]
  );
  const availableDates = useMemo(() => buildAvailableDateOptions(enabledAvailability), [enabledAvailability]);
  const selectedAvailability = useMemo(
    () => availableDates.find((item) => item.value === appointmentDate)?.setting ?? null,
    [appointmentDate, availableDates]
  );
  const timeSlots = useMemo(
    () => (appointmentDate && selectedAvailability ? buildTimeSlots(appointmentDate, selectedAvailability) : []),
    [appointmentDate, selectedAvailability]
  );

  useEffect(() => {
    if (!availableDates.length) return;
    setAppointmentDate((current) => current || availableDates[0].value);
  }, [availableDates]);

  useEffect(() => {
    if (!appointmentDate || !selectedAvailability) return;
    const slots = buildTimeSlots(appointmentDate, selectedAvailability);
    setAppointmentTime((current) => (current && slots.includes(current) ? current : slots[0] || ''));
  }, [appointmentDate, selectedAvailability]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!appointmentDate || !appointmentTime) {
        setError('Vui lòng chọn ngày và giờ khám.');
        setLoading(false);
        return;
      }

      const appointment = dayjs(`${appointmentDate} ${appointmentTime}`, 'YYYY-MM-DD HH:mm');
      const composedNotes = [`Dịch vụ: ${services.find((item) => item.id === selectedService)?.title}`, `Chi nhánh: ${selectedBranch}`, notes.trim()]
        .filter(Boolean)
        .join(' | ');

      await api.post('/appointments', {
        phone,
        appointment_time: appointment.toISOString(),
        notes: composedNotes,
      });

      setSuccess(true);
      setPhone('');
      setNotes('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể gửi yêu cầu đặt lịch lúc này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicShell active="booking">
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <header className="mb-14 max-w-2xl">
            <h1 className="font-['Manrope'] text-5xl font-extrabold leading-tight tracking-[-0.04em] text-[#00478d] sm:text-6xl">
              Đặt lịch khám trực tuyến
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Chọn dịch vụ, ngày khám và khung giờ còn trống để gửi yêu cầu trực tiếp tới hệ thống của AnVy Clinic.
            </p>
          </header>

          <div className="grid gap-12 lg:grid-cols-[0.66fr_0.34fr]">
            <div className="space-y-10">
              <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-8 flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] font-bold text-white">
                    1
                  </span>
                  <h2 className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-slate-900">Chọn dịch vụ</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedService(service.id)}
                      className={`rounded-[24px] border p-6 text-center transition ${
                        selectedService === service.id
                          ? 'border-[#00478d] bg-[#d6e3ff]/40'
                          : 'border-slate-200 hover:border-[#00478d]'
                      }`}
                    >
                      <p className="font-['Manrope'] text-lg font-extrabold text-slate-900">{service.title}</p>
                      <p className="mt-2 text-sm text-slate-500">{service.subtitle}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] bg-[#f2f4f6] p-8">
                <div className="mb-8 flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] font-bold text-white">
                    2
                  </span>
                  <h2 className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-slate-900">
                    Chi nhánh & thời gian
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Chọn chi nhánh</label>
                    <select
                      value={selectedBranch}
                      onChange={(event) => setSelectedBranch(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none transition focus:border-[#00478d]"
                    >
                      {branches.map((branch) => (
                        <option key={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Chọn ngày khám</label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {availableDates.map((date) => (
                        <button
                          key={date.value}
                          type="button"
                          onClick={() => setAppointmentDate(date.value)}
                          className={`rounded-2xl border px-4 py-3 text-left transition ${
                            appointmentDate === date.value
                              ? 'border-[#00478d] bg-[#00478d] text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-[#00478d]'
                          }`}
                        >
                          <span className="block font-semibold">{date.label}</span>
                          <span className={`mt-1 block text-xs ${appointmentDate === date.value ? 'text-blue-100' : 'text-slate-500'}`}>
                            {date.setting.start_time} - {date.setting.end_time}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <label className="mb-3 block text-sm font-semibold text-slate-500">Khung giờ còn trống</label>
                  {timeSlots.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">
                      Hiện chưa có khung giờ phù hợp cho ngày này.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setAppointmentTime(slot)}
                          className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                            appointmentTime === slot
                              ? 'border-[#00478d] bg-[#00478d] text-white shadow-md shadow-blue-900/15'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-[#00478d] hover:text-[#00478d]'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-8 flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] font-bold text-white">
                    3
                  </span>
                  <h2 className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-slate-900">
                    Thông tin liên hệ
                  </h2>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-500">Số điện thoại *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="090 000 0000"
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-[#f7f9fb] px-4 py-4 text-slate-900 outline-none transition focus:border-[#00478d]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-500">Ghi chú</label>
                      <textarea
                        rows={4}
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Mô tả ngắn triệu chứng hoặc yêu cầu cần lưu ý"
                        className="w-full rounded-2xl border border-slate-200 bg-[#f7f9fb] px-4 py-4 text-slate-900 outline-none transition focus:border-[#00478d]"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      Yêu cầu đặt lịch đã được gửi. Phòng khám sẽ liên hệ xác nhận với bạn sớm nhất.
                    </div>
                  )}

                  <div className="mt-10 flex flex-col gap-4 rounded-[24px] bg-[#fff1d1] px-6 py-6 md:flex-row md:items-center md:justify-between">
                    <p className="max-w-xl text-sm leading-7 text-[#5d4201]">
                      Bằng cách nhấn xác nhận, bạn đồng ý để hệ thống lưu số điện thoại, dịch vụ đã chọn và khung giờ hẹn
                      để phòng khám liên hệ xác nhận.
                    </p>
                    <button
                      type="submit"
                      disabled={loading || !appointmentDate || !appointmentTime}
                      className="rounded-full bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] px-8 py-3.5 font-['Manrope'] text-base font-extrabold text-white shadow-lg shadow-blue-900/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? 'Đang gửi...' : 'Xác nhận đặt lịch'}
                    </button>
                  </div>
                </form>
              </section>
            </div>

            <aside className="space-y-8 lg:sticky lg:top-28">
              <div className="relative overflow-hidden rounded-[32px] bg-[#00478d] p-8 text-white shadow-2xl shadow-blue-900/20">
                <div className="relative z-10">
                  <h3 className="font-['Manrope'] text-2xl font-extrabold">Chuẩn bị trước khi khám</h3>
                  <div className="mt-6 space-y-5 text-sm leading-7 text-blue-50/90">
                    <p>• Mang theo đơn kính cũ hoặc toa đang sử dụng nếu có.</p>
                    <p>• Hạn chế đeo kính áp tròng ít nhất 24 giờ trước khi đo khám.</p>
                    <p>• Đến sớm khoảng 10 phút để hoàn thiện thủ tục tiếp nhận tại quầy.</p>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-8 text-[10rem] text-white/10">◔</div>
              </div>

              <div className="overflow-hidden rounded-[32px] bg-white shadow-sm">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0tQRluUKrRbIXP6lelceZyXFK3vGI0NV4h6aBIBl_zPFsWpkbZwrdoLXUJ1BdRis2hwzUGFi8oObsaav28IWHh2NFT8SDq7q3c1usP4USk1EmSIEoc9WnlvdqYV26rWLO-REfwJNQyo49ze5MlFtRl9T-Rx7g-9Swiq6SZxoL1-hS0iT3NHn7nOzw-pLfrQ-a9QmWlib_hRttHdNfpNL4YwGO5xQwtTZ8dJCCDE1Ar3ZQ9bRwotEibBw4ZoXS_xmtFKrgyFFsl6Sq"
                  alt="Thiết bị nhãn khoa hiện đại"
                  className="h-64 w-full object-cover"
                />
                <div className="p-8">
                  <span className="rounded-full bg-[#fed488] px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-[#5d4201]">
                    Technology
                  </span>
                  <h3 className="mt-4 font-['Manrope'] text-2xl font-extrabold tracking-tight text-slate-900">
                    Công nghệ hiện đại bậc nhất
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Hệ thống máy đo khúc xạ và thiết bị kiểm tra thị lực chuyên sâu giúp đưa ra kết quả chính xác tới
                    từng chi tiết nhỏ.
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-500">Cần hỗ trợ gấp?</p>
                <a href="tel:19001234" className="mt-4 block font-['Manrope'] text-3xl font-black text-[#00478d]">
                  1900 1234
                </a>
                <p className="mt-2 text-sm text-slate-500">Hỗ trợ 24/7 cho các trường hợp cần tư vấn nhanh</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
