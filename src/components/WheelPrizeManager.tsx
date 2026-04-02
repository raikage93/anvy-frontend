import { useEffect, useState } from 'react';
import api from '../services/api';
import type { WheelPrize, WheelSettings, WheelSpin } from '../types';
import WheelClaimScanner from './WheelClaimScanner';
import LuckyWheelBoard from './LuckyWheelBoard';

type PrizeFormState = {
  id: number | null;
  name: string;
  description: string;
  total_quantity: string;
  remaining_quantity: string;
  color: string;
  sort_order: string;
  is_active: boolean;
};

const initialForm: PrizeFormState = {
  id: null,
  name: '',
  description: '',
  total_quantity: '10',
  remaining_quantity: '10',
  color: '#005eb8',
  sort_order: '0',
  is_active: true,
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function WheelPrizeManager() {
  const [form, setForm] = useState<PrizeFormState>(initialForm);
  const [prizes, setPrizes] = useState<WheelPrize[]>([]);
  const [spins, setSpins] = useState<WheelSpin[]>([]);
  const [wheelSettings, setWheelSettings] = useState<WheelSettings>({ max_daily_spins_per_phone: 1 });
  const [maxDailySpinsInput, setMaxDailySpinsInput] = useState('1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activePrizes = prizes.filter((item) => item.is_active);

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prizeRes, spinRes, settingsRes] = await Promise.all([
        api.get('/admin/wheel-prizes'),
        api.get('/admin/wheel-spins'),
        api.get('/admin/wheel-settings'),
      ]);
      setPrizes(prizeRes.data);
      setSpins(spinRes.data);
      setWheelSettings(settingsRes.data);
      setMaxDailySpinsInput(String(settingsRes.data.max_daily_spins_per_phone));
    } catch {
      setPrizes([]);
      setSpins([]);
      setWheelSettings({ max_daily_spins_per_phone: 1 });
      setMaxDailySpinsInput('1');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      name: form.name,
      description: form.description,
      total_quantity: Number(form.total_quantity),
      remaining_quantity: Number(form.remaining_quantity),
      color: form.color,
      sort_order: Number(form.sort_order),
      is_active: form.is_active,
    };

    try {
      if (form.id) {
        await api.put(`/admin/wheel-prizes/${form.id}`, payload);
        setMessage({ type: 'success', text: 'Đã cập nhật giải thưởng.' });
      } else {
        await api.post('/admin/wheel-prizes', payload);
        setMessage({ type: 'success', text: 'Đã tạo giải thưởng mới.' });
      }

      resetForm();
      await fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Không thể lưu giải thưởng.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (prize: WheelPrize) => {
    setForm({
      id: prize.id,
      name: prize.name,
      description: prize.description,
      total_quantity: String(prize.total_quantity),
      remaining_quantity: String(prize.remaining_quantity),
      color: prize.color,
      sort_order: String(prize.sort_order),
      is_active: prize.is_active,
    });
    setMessage(null);
  };

  const handleDelete = async (prizeId: number) => {
    if (!window.confirm('Bạn có chắc muốn xoá giải thưởng này?')) {
      return;
    }

    try {
      await api.delete(`/admin/wheel-prizes/${prizeId}`);
      setMessage({ type: 'success', text: 'Đã xoá giải thưởng.' });
      if (form.id === prizeId) {
        resetForm();
      }
      await fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Không thể xoá giải thưởng.' });
    }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    setMessage(null);

    try {
      const response = await api.put('/admin/wheel-settings', {
        max_daily_spins_per_phone: Number(maxDailySpinsInput),
      });
      setWheelSettings(response.data);
      setMaxDailySpinsInput(String(response.data.max_daily_spins_per_phone));
      setMessage({ type: 'success', text: 'Đã cập nhật giới hạn lượt quay theo ngày.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Không thể lưu giới hạn lượt quay.' });
    } finally {
      setSettingsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {message ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border border-green-500/30 bg-green-500/10 text-green-400'
              : 'border border-red-500/30 bg-red-500/10 text-red-400'
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <WheelClaimScanner onClaimUpdated={() => void fetchData()} />

      <div className="rounded-[28px] border border-border bg-surface-light p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-light">Luật chơi mỗi ngày</p>
        <h2 className="mt-3 text-2xl font-semibold text-text">Giới hạn lượt quay theo số điện thoại</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-text-muted">
          Khi user bấm quay, hệ thống sẽ bắt nhập số điện thoại. Backend dùng số điện thoại này để kiểm tra số lượt đã chơi
          trong ngày và cũng dùng để đối chiếu lúc nhận quà.
        </p>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end">
          <label className="block min-w-[220px] text-sm text-text-muted">
            <span className="mb-1.5 block">Số lượt tối đa mỗi ngày / số điện thoại</span>
            <input
              type="number"
              min="1"
              max="20"
              value={maxDailySpinsInput}
              onChange={(event) => setMaxDailySpinsInput(event.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={settingsSaving}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {settingsSaving ? 'Đang lưu...' : 'Lưu giới hạn'}
            </button>
            <div className="rounded-2xl border border-border bg-surface px-5 py-3 text-sm text-text-muted">
              Đang áp dụng: <span className="font-semibold text-text">{wheelSettings.max_daily_spins_per_phone}</span> lượt / ngày
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="rounded-[28px] border border-border bg-surface-light p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-light">Thiết lập giải thưởng</p>
          <h2 className="mt-3 text-2xl font-semibold text-text">
            {form.id ? 'Chỉnh sửa giải thưởng' : 'Tạo giải thưởng mới'}
          </h2>
          <p className="mt-2 text-sm leading-7 text-text-muted">
            Tỉ lệ trúng của mỗi giải được backend tính theo số lượng còn lại tại thời điểm user bấm quay.
          </p>

          <div className="mt-6 grid gap-4">
            <label className="block text-sm text-text-muted">
              <span className="mb-1.5 block">Tên giải thưởng</span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="Ví dụ: Voucher khám mắt miễn phí"
              />
            </label>

            <label className="block text-sm text-text-muted">
              <span className="mb-1.5 block">Mô tả</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="Mô tả ngắn để hiển thị cho user sau khi trúng thưởng."
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-text-muted">
                <span className="mb-1.5 block">Tổng số lượng</span>
                <input
                  type="number"
                  min="0"
                  value={form.total_quantity}
                  onChange={(event) => setForm((current) => ({ ...current, total_quantity: event.target.value }))}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </label>

              <label className="block text-sm text-text-muted">
                <span className="mb-1.5 block">Số lượng còn lại</span>
                <input
                  type="number"
                  min="0"
                  value={form.remaining_quantity}
                  onChange={(event) => setForm((current) => ({ ...current, remaining_quantity: event.target.value }))}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-text-muted">
                <span className="mb-1.5 block">Màu hiển thị</span>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
                    className="h-10 w-14 cursor-pointer rounded-lg border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
                    className="min-w-0 flex-1 bg-transparent text-text outline-none"
                  />
                </div>
              </label>

              <label className="block text-sm text-text-muted">
                <span className="mb-1.5 block">Thứ tự hiển thị</span>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </label>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
                className="h-4 w-4 rounded border-border bg-surface-light text-primary focus:ring-primary"
              />
              Hiển thị giải thưởng này trên vòng quay
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : form.id ? 'Cập nhật giải thưởng' : 'Tạo giải thưởng'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-text transition hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Tạo form mới
            </button>
          </div>
        </form>

        <div className="rounded-[28px] border border-border bg-surface-light p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-light">Preview</p>
          <h2 className="mt-3 text-2xl font-semibold text-text">Xem nhanh vòng quay hiện tại</h2>
          <p className="mt-2 text-sm leading-7 text-text-muted">
            Đây là thứ user sẽ nhìn thấy ngoài trang public. Các ô có số lượng còn lại bằng 0 vẫn hiển thị nhưng không thể trúng.
          </p>

          <div className="mt-6">
            {activePrizes.length ? (
              <LuckyWheelBoard
                prizes={activePrizes}
                rotation={0}
                isSpinning={false}
                spinDisabled
                buttonLabel="Preview"
                helperText="Preview admin chỉ để kiểm tra thứ tự ô, màu sắc và số lượng còn lại."
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-text-muted">
                Chưa có giải thưởng nào đang bật để preview.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-border bg-surface-light p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-light">Danh sách giải thưởng</p>
            <h3 className="mt-3 text-xl font-semibold text-text">Quản lý các ô trên vòng quay</h3>
          </div>
          <button
            type="button"
            onClick={fetchData}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-text transition hover:border-white/25"
          >
            Tải lại dữ liệu
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          {prizes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-text-muted">
              Chưa có giải thưởng nào. Hãy tạo ít nhất một giải trước khi mở vòng quay cho user.
            </div>
          ) : (
            prizes.map((prize) => (
              <article key={prize.id} className="rounded-2xl border border-border/80 bg-surface px-4 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="mt-1 h-5 w-5 shrink-0 rounded-full border border-white/10" style={{ backgroundColor: prize.color }} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-text">{prize.name}</p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                            prize.is_active
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-slate-500/15 text-slate-300'
                          }`}
                        >
                          {prize.is_active ? 'Đang bật' : 'Đang tắt'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-text-muted">{prize.description || 'Chưa có mô tả.'}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4 lg:min-w-[420px]">
                    <div className="rounded-xl bg-surface-light px-3 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Tổng</p>
                      <p className="mt-2 text-sm font-semibold text-text">{prize.total_quantity}</p>
                    </div>
                    <div className="rounded-xl bg-surface-light px-3 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Còn lại</p>
                      <p className="mt-2 text-sm font-semibold text-text">{prize.remaining_quantity}</p>
                    </div>
                    <div className="rounded-xl bg-surface-light px-3 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Thứ tự</p>
                      <p className="mt-2 text-sm font-semibold text-text">{prize.sort_order}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(prize)}
                        className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(prize.id)}
                        className="rounded-xl border border-red-500/40 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      <div className="rounded-[28px] border border-border bg-surface-light p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-light">Lịch sử quay</p>
        <h3 className="mt-3 text-xl font-semibold text-text">100 lượt nhận thưởng gần nhất</h3>
        <div className="mt-5 space-y-3">
          {spins.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-text-muted">
              Chưa có lượt quay nào được ghi nhận.
            </div>
          ) : (
            spins.map((spin) => (
              <article key={spin.id} className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded-full border border-white/10" style={{ backgroundColor: spin.prize_color }} />
                  <div>
                    <p className="text-sm font-semibold text-text">{spin.prize_name}</p>
                    <p className="text-xs text-text-muted">
                      {spin.phone ? `SĐT ${spin.phone}` : 'Chưa lưu số điện thoại'} · {spin.prize_description || 'Không có mô tả.'}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-text-muted">Trao lúc {formatDateTime(spin.created_at)}</div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
