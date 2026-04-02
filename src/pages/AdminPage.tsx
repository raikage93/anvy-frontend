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

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'account', label: 'Tài khoản mặc định', icon: '🏦' },
    { key: 'availability', label: 'Lịch làm việc', icon: '🗓️' },
    { key: 'appointments', label: 'Lịch hẹn', icon: '📅' },
    { key: 'wheel', label: 'Vòng quay', icon: '🎯' },
    { key: 'password', label: 'Đổi mật khẩu', icon: '🔒' },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:py-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <BrandMark size="sm" darkBg />
            <span className="font-bold text-text">Admin</span>
            <span className="max-w-[140px] truncate rounded-full bg-surface-lighter px-2 py-0.5 text-xs text-text-muted">
              {user?.username}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-text-muted transition-colors hover:text-primary"
            >
              Trang chủ
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-sm text-red-400 transition-colors hover:text-red-300"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="mb-6 flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setTab(item.key);
                  setMessage(null);
                }}
                className={`flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  tab === item.key
                    ? 'bg-primary text-white'
                    : 'bg-surface-light text-text-muted hover:bg-surface-lighter'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {message && (
            <div
              className={`mb-4 rounded-xl px-4 py-3 text-sm ${
                message.type === 'success'
                  ? 'border border-green-500/30 bg-green-500/10 text-green-400'
                  : 'border border-red-500/30 bg-red-500/10 text-red-400'
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
                <div className="rounded-[28px] border border-border bg-surface-light p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-light">Thiết lập lịch khám</p>
                  <h2 className="mt-3 text-2xl font-semibold text-text">Bật hoặc tắt từng ngày trong tuần</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-text-muted">
                    User chỉ có thể chọn đúng các ngày đang bật và nằm trong khung giờ bạn cấu hình ở đây.
                  </p>

                  <div className="mt-6 space-y-3">
                    {availability.map((item) => (
                      <div
                        key={item.weekday}
                        className="rounded-2xl border border-border/80 bg-surface px-4 py-4"
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
                              className="mt-1 h-4 w-4 rounded border-border bg-surface-light text-primary focus:ring-primary"
                            />
                            <div>
                              <label htmlFor={`available-${item.weekday}`} className="text-sm font-semibold text-text">
                                {item.label}
                              </label>
                              <p className="mt-1 text-xs text-text-muted">
                                {item.enabled
                                  ? 'Ngày này đang mở lịch cho người dùng đặt khám.'
                                  : 'Ngày này đang tắt và sẽ không xuất hiện ở form đặt lịch.'}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
                            <label className="block text-sm text-text-muted">
                              <span className="mb-1.5 block">Bắt đầu</span>
                              <input
                                type="time"
                                value={item.start_time || '08:00'}
                                disabled={!item.enabled}
                                onChange={(event) =>
                                  updateAvailabilityField(item.weekday, 'start_time', event.target.value)
                                }
                                className="w-full rounded-xl border border-border bg-surface-light px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
                              />
                            </label>
                            <label className="block text-sm text-text-muted">
                              <span className="mb-1.5 block">Kết thúc</span>
                              <input
                                type="time"
                                value={item.end_time || '17:00'}
                                disabled={!item.enabled}
                                onChange={(event) =>
                                  updateAvailabilityField(item.weekday, 'end_time', event.target.value)
                                }
                                className="w-full rounded-xl border border-border bg-surface-light px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
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
                      className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {availabilitySaving ? 'Đang lưu lịch...' : 'Lưu lịch làm việc'}
                    </button>
                    <button
                      type="button"
                      onClick={fetchAvailability}
                      disabled={availabilitySaving}
                      className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-text transition hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Tải lại từ server
                    </button>
                  </div>
                </div>

                <div className="rounded-[28px] border border-border bg-surface-light p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-light">Xem nhanh</p>
                  <h3 className="mt-3 text-xl font-semibold text-text">Lịch làm việc đang áp dụng cho user</h3>
                  <div className="mt-5">
                    <AvailabilitySummary settings={availability} />
                  </div>
                </div>
              </div>
            ))}

          {tab === 'password' && (
            <form onSubmit={handleChangePassword} className="max-w-sm space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-muted">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-surface-light px-4 py-3 text-text placeholder:text-text-muted/50 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-muted">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Mật khẩu mới"
                  className="w-full rounded-xl border border-border bg-surface-light px-4 py-3 text-text placeholder:text-text-muted/50 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                type="submit"
                disabled={pwLoading || !currentPw || !newPw}
                className="w-full rounded-xl bg-primary py-3 font-semibold text-white transition-all hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
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
              <div className="rounded-2xl border border-border bg-surface-light p-5 text-sm text-text-muted">
                Chưa có lịch hẹn nào được gửi từ trang chủ.
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <article
                    key={appointment.id}
                    className="rounded-2xl border border-border bg-surface-light p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-text">{appointment.phone}</p>
                        <p className="mt-1 text-sm text-text-muted">
                          Lịch khám: {formatDateTime(appointment.appointment_time)}
                        </p>
                      </div>
                      <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                        {appointment.status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl bg-surface px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Gửi lúc</p>
                        <p className="mt-2 text-sm text-text">{formatDateTime(appointment.created_at)}</p>
                      </div>
                      <div className="rounded-xl bg-surface px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Ghi chú</p>
                        <p className="mt-2 text-sm text-text">{appointment.notes || 'Không có ghi chú'}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
