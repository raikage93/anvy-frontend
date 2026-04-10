import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import PublicShell from '../components/PublicShell';
import api from '../services/api';
import type { PatientRecord } from '../types';

type PrescriptionMode = 'unaided' | 'new' | 'old';

const clinicalImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDNiWnnUxXEuVUZi0VxLvUwplrsfygR6emG0YAMyoLwtAAc8JD5sRXlZwTVwixLUSz1VyJ-LJSOOcRfHNEQMqTHI2yaXzcq4oi0SBghg94xzcPz9XOGd0xvJR-OXgXgGw5VvnM6Pf7fFBl8g1VgdY3a-2Fcs0hbAkntetb-Ja8CHi4rkqEGd_Nc8SsIOXr92ZRTx_svHit8FyyPGBxEUT9z_DFbGitXmyFoAR6NA5Zg3dHtBUfFj-6U4Y-QnftoCNGs42JfGlZ7WTZV';

function display(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function formatDate(value: string) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatShortDate(value: string) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN').format(date);
}

function formatDiopter(value: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}`;
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }
  return 'Không thể tra cứu kết quả lúc này. Vui lòng thử lại sau.';
}

function getRecommendations(record: PatientRecord) {
  const source = record.clinical_diagnosis || record.quick_medical_assessment;
  const parts = source
    .split(/\n|\.|;/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length > 0) return parts.slice(0, 3);

  return [
    'Thay đổi toa kính theo kết quả khúc xạ mới để cải thiện tầm nhìn.',
    'Theo dõi tình trạng mỏi mắt và duy trì nghỉ ngơi khi dùng thiết bị điện tử.',
    'Tái khám theo lịch hẹn để kiểm tra ổn định thị lực.',
  ];
}

function getTableRows(record: PatientRecord, mode: PrescriptionMode) {
  if (mode === 'unaided') {
    return [
      {
        eye: 'Phải (RE)',
        sphere: null,
        cylinder: null,
        axis: null,
        va: record.va_unaided_mp,
        va_binocular: record.va_unaided_binocular,
      },
      {
        eye: 'Trái (LE)',
        sphere: null,
        cylinder: null,
        axis: null,
        va: record.va_unaided_mt,
        va_binocular: record.va_unaided_binocular,
      },
    ];
  }

  return mode === 'new'
    ? [
        {
          eye: 'Phải (RE)',
          sphere: record.sphere_new_mp,
          cylinder: record.cylinder_new_mp,
          axis: record.axis_new_mp,
          va: record.va_new_mp,
          va_binocular: record.va_new_binocular,
        },
        {
          eye: 'Trái (LE)',
          sphere: record.sphere_new_mt,
          cylinder: record.cylinder_new_mt,
          axis: record.axis_new_mt,
          va: record.va_new_mt,
          va_binocular: record.va_new_binocular,
        },
      ]
    : [
        {
          eye: 'Phải (RE)',
          sphere: record.sphere_old_mp,
          cylinder: record.cylinder_old_mp,
          axis: record.axis_old_mp,
          va: record.va_old_mp,
          va_binocular: record.va_old_binocular,
        },
        {
          eye: 'Trái (LE)',
          sphere: record.sphere_old_mt,
          cylinder: record.cylinder_old_mt,
          axis: record.axis_old_mt,
          va: record.va_old_mt,
          va_binocular: record.va_old_binocular,
        },
      ];
}

function EmptyPanel() {
  return (
    <div className="rounded-lg border border-dashed border-[#c2c6d4] bg-white p-10 text-center shadow-[0_20px_50px_-12px_rgba(25,28,30,0.06)]">
      <p className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-[#191c1e]">Nhập số điện thoại để mở hồ sơ khám</p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#424752]">
        Hệ thống sẽ hiển thị lịch sử thăm khám, ghi chú lâm sàng và toa kính theo đúng dữ liệu phòng khám đã lưu.
      </p>
    </div>
  );
}

export default function PatientPortalPage() {
  const [phone, setPhone] = useState('');
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeMode, setActiveMode] = useState<PrescriptionMode>('unaided');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [message, setMessage] = useState('');

  const selectedRecord = useMemo(
    () => records.find((record) => record.id === selectedId) || records[0] || null,
    [records, selectedId]
  );

  const recommendations = useMemo(
    () => (selectedRecord ? getRecommendations(selectedRecord) : []),
    [selectedRecord]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedPhone = phone.trim();
    if (!normalizedPhone) {
      setMessage('Vui lòng nhập số điện thoại để tra cứu.');
      return;
    }

    setLoading(true);
    setMessage('');
    setHasSearched(true);

    try {
      const response = await api.get<PatientRecord[]>('/patient-records', {
        params: { phone: normalizedPhone },
      });
      const nextRecords = response.data || [];
      setRecords(nextRecords);
      setSelectedId(nextRecords[0]?.id || null);
      setActiveMode('unaided');
      if (nextRecords.length === 0) {
        setMessage('Không tìm thấy kết quả khám theo số điện thoại này.');
      }
    } catch (error) {
      setRecords([]);
      setSelectedId(null);
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicShell active="records">
      <main className="min-h-screen bg-[#f7f9fb] px-3 py-6 font-['Inter'] text-[#191c1e] sm:px-6 sm:py-8 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid gap-4 sm:gap-6 lg:mb-12 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold tracking-tight text-[#191c1e] sm:text-4xl">
                Chi tiết Kết quả Khám
              </h1>
              <p className="text-sm font-medium text-[#424752] sm:text-base">
                Bệnh nhân:{' '}
                <span className="font-bold text-[#00478d]">{selectedRecord ? selectedRecord.full_name : 'Chưa tra cứu'}</span>
                {selectedRecord ? ` • ID: #LUM-${selectedRecord.id}` : null}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-lg border border-[#c2c6d4]/30 bg-white p-3 shadow-[0_20px_50px_-12px_rgba(25,28,30,0.06)] sm:p-4">
              <label htmlFor="patient-phone" className="text-xs font-bold uppercase tracking-widest text-[#424752]">
                Số điện thoại tra cứu
              </label>
              <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
                <input
                  id="patient-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="0901234567"
                  className="h-11 flex-1 rounded-md border-[#c2c6d4] bg-white px-4 text-base font-semibold text-[#191c1e] outline-none transition focus:border-[#00478d] focus:ring-[#00478d]/20 sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-md bg-[#00478d] px-5 text-sm font-semibold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {loading ? 'Đang tải...' : 'Tra cứu'}
                </button>
              </div>
              {message ? <p className="mt-3 rounded-md bg-[#ffdad6] px-3 py-2 text-sm font-semibold text-[#93000a]">{message}</p> : null}
            </form>
          </div>

          {!hasSearched && !selectedRecord ? <EmptyPanel /> : null}

          {selectedRecord ? (
            <div className="grid grid-cols-12 gap-4 sm:gap-6 md:gap-8">
              <aside className="col-span-12 space-y-4 md:col-span-3">
                <div className="rounded-xl border border-[#c2c6d4]/20 bg-[#f2f4f6] p-4 sm:p-6">
                  <h3 className="mb-4 font-['Manrope'] text-sm font-bold uppercase tracking-widest text-[#424752] sm:mb-6">
                    Lịch sử Thăm khám
                  </h3>
                  <div className="space-y-3">
                    {records.map((record, index) => (
                      <button
                        key={record.id}
                        type="button"
                        onClick={() => {
                          setSelectedId(record.id);
                          setActiveMode('unaided');
                        }}
                        className={`w-full rounded-lg p-3 text-left transition-all sm:p-4 ${
                          selectedRecord.id === record.id
                            ? 'border-l-4 border-[#00478d] bg-white shadow-[0_20px_50px_-12px_rgba(25,28,30,0.06)]'
                            : 'hover:bg-[#e6e8ea]'
                        }`}
                      >
                        {selectedRecord.id === record.id ? (
                          <span className="mb-1 block text-xs font-bold text-[#00478d]">Hiện tại</span>
                        ) : null}
                        <span
                          className={`block font-['Manrope'] ${
                            selectedRecord.id === record.id ? 'font-bold text-[#191c1e]' : 'font-medium text-[#424752]'
                          }`}
                        >
                          {formatDate(record.exam_date)}
                        </span>
                        <span className="text-xs text-[#424752] italic">
                          {index === 0 ? 'Đợt khám mới nhất' : display(record.clinical_diagnosis || 'Khám định kỳ')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="group relative h-48 overflow-hidden rounded-xl sm:h-64">
                  <img
                    alt="Clinical setting"
                    className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
                    src={clinicalImage}
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#00478d]/80 to-transparent p-6">
                    <p className="text-sm font-medium leading-relaxed text-white">
                      Đội ngũ chuyên gia luôn sẵn sàng hỗ trợ thị lực của bạn.
                    </p>
                  </div>
                </div>
              </aside>

              <section className="col-span-12 space-y-6 md:col-span-9 md:space-y-8">
                <div className="rounded-xl bg-white p-4 shadow-[0_20px_50px_-12px_rgba(25,28,30,0.06)] sm:p-6 md:p-8">
                  <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-[#c2c6d4]/30 pb-5 sm:mb-10 sm:gap-6 sm:pb-8 md:flex-row md:items-center">
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-[#00478d]">
                        <span className="text-sm">▣</span>
                        <span className="text-xs font-bold uppercase tracking-tighter">
                          Ngày khám: {formatShortDate(selectedRecord.exam_date)}
                        </span>
                      </div>
                      <h2 className="font-['Manrope'] text-xl font-bold sm:text-2xl">Chi tiết Đợt khám Hiện tại</h2>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex w-full items-center justify-center gap-2 rounded-md bg-[#e6e8ea] px-4 py-2 text-sm font-bold text-[#00478d] transition-all hover:bg-[#00478d] hover:text-white sm:w-auto"
                      >
                        <span>⎙</span>
                        In kết quả
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-md bg-[#ffdea5] px-4 py-2 text-sm font-bold text-[#261900] transition-all hover:opacity-90 sm:w-auto"
                      >
                        <span>↗</span>
                        Chia sẻ
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="overflow-x-auto pb-1">
                      <div className="inline-flex min-w-max items-center rounded-full bg-[#e6e8ea] p-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveMode('unaided')}
                        className={`rounded-full px-6 py-2.5 text-sm font-bold transition-colors ${
                          activeMode === 'unaided'
                            ? 'bg-[#00478d] text-white shadow-[0_20px_50px_-12px_rgba(25,28,30,0.06)]'
                            : 'text-[#424752] hover:text-[#191c1e]'
                        }`}
                      >
                        Thị lực không kính
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveMode('new')}
                        className={`rounded-full px-6 py-2.5 text-sm font-bold transition-colors ${
                          activeMode === 'new'
                            ? 'bg-[#00478d] text-white shadow-[0_20px_50px_-12px_rgba(25,28,30,0.06)]'
                            : 'text-[#424752] hover:text-[#191c1e]'
                        }`}
                      >
                        Toa kính Mới
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveMode('old')}
                        className={`rounded-full px-6 py-2.5 text-sm font-bold transition-colors ${
                          activeMode === 'old'
                            ? 'bg-[#00478d] text-white shadow-[0_20px_50px_-12px_rgba(25,28,30,0.06)]'
                            : 'text-[#424752] hover:text-[#191c1e]'
                        }`}
                      >
                        Toa kính Cũ
                      </button>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-[#c2c6d4]/10 bg-white shadow-[0_20px_50px_-12px_rgba(25,28,30,0.06)]">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[680px] border-collapse text-left sm:min-w-[760px]">
                          <thead>
                            <tr className="border-b border-[#c2c6d4]/20 bg-[#f2f4f6]">
                              <th className="px-3 py-3 font-['Manrope'] text-[11px] font-bold uppercase tracking-widest text-[#424752] sm:p-6 sm:text-xs">Mắt</th>
                              {activeMode !== 'unaided' ? (
                                <>
                                  <th className="px-3 py-3 font-['Manrope'] text-[11px] font-bold uppercase tracking-widest text-[#424752] sm:p-6 sm:text-xs">Sphere (SPH)</th>
                                  <th className="px-3 py-3 font-['Manrope'] text-[11px] font-bold uppercase tracking-widest text-[#424752] sm:p-6 sm:text-xs">Cylinder (CYL)</th>
                                  <th className="px-3 py-3 font-['Manrope'] text-[11px] font-bold uppercase tracking-widest text-[#424752] sm:p-6 sm:text-xs">Axis (AX)</th>
                                </>
                              ) : null}
                              <th className="px-3 py-3 font-['Manrope'] text-[11px] font-bold uppercase tracking-widest text-[#424752] sm:p-6 sm:text-xs">Thị lực (VA)</th>
                              <th className="px-3 py-3 font-['Manrope'] text-[11px] font-bold uppercase tracking-widest text-[#424752] sm:p-6 sm:text-xs">Thị lực (2 mắt)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#c2c6d4]/10">
                            {getTableRows(selectedRecord, activeMode).map((row, index) => (
                              <tr key={row.eye} className="transition-colors hover:bg-[#f7f9fb]/50">
                                <td className="px-3 py-3 font-bold text-[#00478d] sm:p-6">{row.eye}</td>
                                {activeMode !== 'unaided' ? (
                                  <>
                                    <td className="px-3 py-3 font-['Manrope'] text-base sm:p-6 sm:text-lg">{formatDiopter(row.sphere)}</td>
                                    <td className="px-3 py-3 font-['Manrope'] text-base sm:p-6 sm:text-lg">{formatDiopter(row.cylinder)}</td>
                                    <td className="px-3 py-3 font-['Manrope'] text-base sm:p-6 sm:text-lg">
                                      {row.axis === null || row.axis === undefined ? '—' : `${row.axis}°`}
                                    </td>
                                  </>
                                ) : null}
                                <td className="px-3 py-3 sm:p-6">
                                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                                    {display(row.va)}
                                  </span>
                                </td>
                                {index === 0 ? (
                                  <td className="px-3 py-3 align-middle sm:p-6" rowSpan={2}>
                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                                      {display(row.va_binocular)}
                                    </span>
                                  </td>
                                ) : null}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                    <div className="rounded-xl border border-[#c2c6d4]/30 bg-[#f8fafc] p-4 shadow-[0_10px_30px_-18px_rgba(25,28,30,0.2)] sm:p-6">
                      <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#424752]">Ghi chú Lâm sàng</h4>
                      <div className="rounded-lg bg-white p-4 text-sm leading-7 text-[#191c1e] sm:p-5">
                        {display(selectedRecord.quick_medical_assessment || selectedRecord.clinical_diagnosis)}
                      </div>
                    </div>
                    {selectedRecord.next_appointment_date ? (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-[0_10px_30px_-18px_rgba(25,28,30,0.2)] sm:p-6">
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-[#00478d]">Lịch hẹn tiếp theo</h4>
                        <p className="font-['Manrope'] text-lg font-extrabold text-[#00478d]">
                          {formatDate(selectedRecord.next_appointment_date)}
                        </p>
                      </div>
                    ) : null}

                    <div className="rounded-xl border border-[#c2c6d4]/30 bg-[#f8fafc] p-4 shadow-[0_10px_30px_-18px_rgba(25,28,30,0.2)] sm:p-6">
                      <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#424752]">Chỉ định Điều trị</h4>
                      <ul className="rounded-lg bg-white p-4 space-y-3 text-sm leading-7 text-[#191c1e] sm:p-5">
                        {recommendations.map((item) => (
                          <li key={item}>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Link
                      to="/eyewear"
                      className="w-full rounded-md bg-[#775a19] px-6 py-2.5 text-center text-sm font-bold text-white shadow-lg shadow-[#775a19]/20 transition-transform hover:scale-105 sm:w-auto"
                    >
                      Chọn Gọng & Đặt Kính
                    </Link>
                  </div>
                </div>

              </section>
            </div>
          ) : null}
        </div>
      </main>
    </PublicShell>
  );
}
