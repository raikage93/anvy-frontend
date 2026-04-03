import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DefaultInfoForm from '../components/DefaultInfoForm';
import BrandMark from '../components/BrandMark';
import AvailabilitySummary from '../components/AvailabilitySummary';
import WheelPrizeManager from '../components/WheelPrizeManager';
import api from '../services/api';
import type { Appointment, AvailabilitySetting, DefaultInfo } from '../types';

type Tab = 'account' | 'availability' | 'appointments' | 'wheel' | 'password';

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('account');
  const [defaultAccount, setDefaultAccount] = useState<DefaultInfo | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    fetchDefaultAccount();
    fetchAppointments();
    fetchAvailability();
  }, []);

  const fetchDefaultAccount = async () => {
    try {
      const res = await api.get('/admin/default-account');
      setDefaultAccount(res.data);
    } catch {
      // no account yet
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/admin/appointments');
      setAppointments(res.data);
    } catch {
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const res = await api.get('/admin/availability');
      setAvailability(res.data);
    } catch {
      setAvailability([]);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleSaveAccount = async (info: DefaultInfo) => {
    try {
      const res = await api.put('/admin/default-account', {
        bank_bin: info.bankBin,
        bank_name: info.bankName,
        bank_logo: info.bankLogo,
        account_no: info.accountNo,
        description: info.description,
      });
      setDefaultAccount({
        bankBin: res.data.bank_bin,
        bankName: res.data.bank_name,
        bankLogo: res.data.bank_logo,
        accountNo: res.data.account_no,
        description: res.data.description,
      });
      setMessage({ type: 'success', text: 'Đã lưu thông tin tài khoản!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Lỗi khi lưu' });
    }
  };

  const updateAvailabilityField = (
    weekday: number,
    field: 'enabled' | 'start_time' | 'end_time',
    value: boolean | string | null
  ) => {
    setAvailability((current) =>
      current.map((item) => {
        if (item.weekday !== weekday) {
          return item;
        }

        if (field === 'enabled') {
          const enabled = Boolean(value);
          return {
            ...item,
            enabled,
            start_time: enabled ? item.start_time || '08:00' : null,
            end_time: enabled ? item.end_time || '17:00' : null,
          };
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const handleSaveAvailability = async () => {
    setAvailabilitySaving(true);
    setMessage(null);

    try {
      const res = await api.put('/admin/availability', {
        settings: availability.map((item) => ({
          weekday: item.weekday,
          enabled: item.enabled,
          start_time: item.enabled ? item.start_time : null,
          end_time: item.enabled ? item.end_time : null,
        })),
      });

      setAvailability(res.data);
      setMessage({ type: 'success', text: 'Đã cập nhật lịch làm việc của phòng khám.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Không thể lưu lịch làm việc.' });
    } finally {
      setAvailabilitySaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    setMessage(null);
    try {
      await api.patch('/admin/change-password', {
        current_password: currentPw,
        new_password: newPw,
      });
      setCurrentPw('');
      setNewPw('');
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Lỗi khi đổi mật khẩu' });
    } finally {
      setPwLoading(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: string; hint: string }[] = [
    { key: 'account', label: 'Tài khoản mặc định', icon: '🏦', hint: 'Quản lý thông tin tài khoản nhận thanh toán.' },
    { key: 'availability', label: 'Lịch làm việc', icon: '🗓️', hint: 'Thiết lập ngày và giờ mở lịch khám cho khách hàng.' },
    { key: 'appointments', label: 'Lịch hẹn', icon: '📅', hint: 'Theo dõi các lịch đặt khám gửi từ website.' },
    { key: 'wheel', label: 'Vòng quay', icon: '🎯', hint: 'Cấu hình phần thưởng và xác thực nhận quà.' },
    { key: 'password', label: 'Đổi mật khẩu', icon: '🔒', hint: 'Cập nhật mật khẩu đăng nhập quản trị viên.' },
  ];
  const currentTab = tabs.find((item) => item.key === tab) || tabs[0];

  return (
    <div
      className="min-h-dvh bg-[#edf2f7] [--color-primary:#005eb8] [--color-primary-dark:#00478d] [--color-surface:#ffffff] [--color-surface-light:#f8fafc] [--color-surface-lighter:#edf2ff] [--color-accent-light:#00478d] [--color-text:#0f172a] [--color-text-muted:#64748b] [--color-border:#dbe3ee]"
    >
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark size="sm" />
            <div className="min-w-0">
              <p className="font-['Manrope'] text-lg font-extrabold text-slate-900">AnVy Clinic Admin</p>
              <p className="truncate text-xs font-medium text-slate-500">{user?.username}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#00478d] hover:text-[#00478d]"
            >
              Trang chủ
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#00478d]">Điều hướng</p>
                <h2 className="mt-3 font-['Manrope'] text-xl font-extrabold text-slate-900">Quản trị hệ thống</h2>
                <div className="mt-5 space-y-2">
                  {tabs.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        setTab(item.key);
                        setMessage(null);
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                        tab === item.key
                          ? 'bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] text-white shadow-lg shadow-blue-900/20'
                          : 'bg-[#f7f9fc] text-slate-700 hover:bg-[#ecf2ff] hover:text-[#00478d]'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Trạng thái</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Bạn đang đăng nhập với quyền quản trị viên. Mọi thay đổi được áp dụng trực tiếp lên hệ thống production.
                </p>
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
              <label htmlFor="admin-mobile-tab" className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Menu quản trị
              </label>
              <select
                id="admin-mobile-tab"
                value={tab}
                onChange={(event) => {
                  setTab(event.target.value as Tab);
                  setMessage(null);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#00478d] focus:ring-2 focus:ring-[#00478d]/20"
              >
                {tabs.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 border-b border-slate-200 pb-5">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#00478d]">Dashboard</p>
                <h1 className="mt-3 font-['Manrope'] text-3xl font-extrabold tracking-[-0.02em] text-slate-900">
                  <span className="mr-2">{currentTab.icon}</span>
                  {currentTab.label}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{currentTab.hint}</p>
              </div>

              {message && (
                <div
                  className={`mb-5 rounded-2xl px-4 py-3 text-sm font-medium ${
                    message.type === 'success'
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  {message.text}
                </div>
              )}

          {tab === 'account' &&
            (loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
              </div>
            ) : (
              <DefaultInfoForm initialData={defaultAccount} onSave={handleSaveAccount} />
            ))}

          {tab === 'availability' &&
            (availabilityLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-[28px] border border-slate-200 bg-[#f8fafc] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#00478d]">Thiết lập lịch khám</p>
                  <h2 className="mt-3 font-['Manrope'] text-2xl font-extrabold text-slate-900">Bật hoặc tắt từng ngày trong tuần</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                    User chỉ có thể chọn đúng các ngày đang bật và nằm trong khung giờ bạn cấu hình ở đây.
                  </p>

                  <div className="mt-6 space-y-3">
                    {availability.map((item) => (
                      <div
                        key={item.weekday}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-start gap-3">
                            <input
                              id={`available-${item.weekday}`}
                              type="checkbox"
                              checked={item.enabled}
                              onChange={(event) =>
                                updateAvailabilityField(item.weekday, 'enabled', event.target.checked)
                              }
                              className="mt-1 h-4 w-4 rounded border-slate-300 bg-white text-[#00478d] focus:ring-[#00478d]"
                            />
                            <div>
                              <label htmlFor={`available-${item.weekday}`} className="text-sm font-semibold text-slate-900">
                                {item.label}
                              </label>
                              <p className="mt-1 text-xs text-slate-500">
                                {item.enabled
                                  ? 'Ngày này đang mở lịch cho người dùng đặt khám.'
                                  : 'Ngày này đang tắt và sẽ không xuất hiện ở form đặt lịch.'}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
                            <label className="block text-sm text-slate-600">
                              <span className="mb-1.5 block">Bắt đầu</span>
                              <input
                                type="time"
                                value={item.start_time || '08:00'}
                                disabled={!item.enabled}
                                onChange={(event) =>
                                  updateAvailabilityField(item.weekday, 'start_time', event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-[#00478d] focus:ring-2 focus:ring-[#00478d]/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              />
                            </label>
                            <label className="block text-sm text-slate-600">
                              <span className="mb-1.5 block">Kết thúc</span>
                              <input
                                type="time"
                                value={item.end_time || '17:00'}
                                disabled={!item.enabled}
                                onChange={(event) =>
                                  updateAvailabilityField(item.weekday, 'end_time', event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-[#00478d] focus:ring-2 focus:ring-[#00478d]/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleSaveAvailability}
                      disabled={availabilitySaving || availability.length !== 7}
                      className="rounded-2xl bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {availabilitySaving ? 'Đang lưu lịch...' : 'Lưu lịch làm việc'}
                    </button>
                    <button
                      type="button"
                      onClick={fetchAvailability}
                      disabled={availabilitySaving}
                      className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#00478d] hover:text-[#00478d] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Tải lại từ server
                    </button>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-[#f8fafc] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#00478d]">Xem nhanh</p>
                  <h3 className="mt-3 font-['Manrope'] text-xl font-extrabold text-slate-900">Lịch làm việc đang áp dụng cho user</h3>
                  <div className="mt-5">
                    <AvailabilitySummary settings={availability} />
                  </div>
                </div>
              </div>
            ))}

          {tab === 'password' && (
            <form onSubmit={handleChangePassword} className="max-w-sm space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-all focus:border-[#00478d] focus:outline-none focus:ring-2 focus:ring-[#00478d]/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Mật khẩu mới"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-all focus:border-[#00478d] focus:outline-none focus:ring-2 focus:ring-[#00478d]/30"
                />
              </div>
              <button
                type="submit"
                disabled={pwLoading || !currentPw || !newPw}
                className="w-full rounded-xl bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] py-3 font-semibold text-white transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
              >
                {pwLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </button>
            </form>
          )}

          {tab === 'wheel' && <WheelPrizeManager />}

          {tab === 'appointments' &&
            (appointmentsLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5 text-sm text-slate-600">
                Chưa có lịch hẹn nào được gửi từ trang chủ.
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <article
                    key={appointment.id}
                    className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{appointment.phone}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Lịch khám: {formatDateTime(appointment.appointment_time)}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {appointment.status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl bg-white px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Gửi lúc</p>
                        <p className="mt-2 text-sm text-slate-800">{formatDateTime(appointment.created_at)}</p>
                      </div>
                      <div className="rounded-xl bg-white px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Ghi chú</p>
                        <p className="mt-2 text-sm text-slate-800">{appointment.notes || 'Không có ghi chú'}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
