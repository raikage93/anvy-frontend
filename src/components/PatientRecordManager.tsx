import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import type { PatientExamResult, PatientProfile } from '../types';

type View = 'list' | 'create' | 'detail';

type ProfileFormPayload = {
  full_name: string;
  birth_year: string;
  phone: string;
  address: string;
};

type ExamResultFormPayload = {
  exam_date: string;
  next_appointment_date: string;
  quick_medical_assessment: string;
  va_unaided_mp: string;
  va_unaided_mt: string;
  va_unaided_binocular: string;
  va_old_mp: string;
  va_old_mt: string;
  va_old_binocular: string;
  va_new_mp: string;
  va_new_mt: string;
  va_new_binocular: string;
  sphere_old_mp: string;
  cylinder_old_mp: string;
  axis_old_mp: string;
  sphere_old_mt: string;
  cylinder_old_mt: string;
  axis_old_mt: string;
  sphere_new_mp: string;
  cylinder_new_mp: string;
  axis_new_mp: string;
  sphere_new_mt: string;
  cylinder_new_mt: string;
  axis_new_mt: string;
  clinical_diagnosis: string;
};

type Props = {
  searchQuery: string;
  newEntrySignal: number;
  onMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
};

function emptyProfileForm(): ProfileFormPayload {
  return {
    full_name: '',
    birth_year: '',
    phone: '',
    address: '',
  };
}

function emptyResultForm(): ExamResultFormPayload {
  return {
    exam_date: new Date().toISOString().slice(0, 10),
    next_appointment_date: '',
    quick_medical_assessment: '',
    va_unaided_mp: '',
    va_unaided_mt: '',
    va_unaided_binocular: '',
    va_old_mp: '',
    va_old_mt: '',
    va_old_binocular: '',
    va_new_mp: '',
    va_new_mt: '',
    va_new_binocular: '',
    sphere_old_mp: '',
    cylinder_old_mp: '',
    axis_old_mp: '',
    sphere_old_mt: '',
    cylinder_old_mt: '',
    axis_old_mt: '',
    sphere_new_mp: '',
    cylinder_new_mp: '',
    axis_new_mp: '',
    sphere_new_mt: '',
    cylinder_new_mt: '',
    axis_new_mt: '',
    clinical_diagnosis: '',
  };
}

function profileToForm(profile: PatientProfile): ProfileFormPayload {
  return {
    full_name: profile.full_name,
    birth_year: profile.birth_year === null || profile.birth_year === undefined ? '' : String(profile.birth_year),
    phone: profile.phone,
    address: profile.address,
  };
}

function resultToForm(result: PatientExamResult): ExamResultFormPayload {
  const n = (value: number | null | undefined) => (value === null || value === undefined ? '' : String(value));
  return {
    exam_date: result.exam_date,
    next_appointment_date: result.next_appointment_date || '',
    quick_medical_assessment: result.quick_medical_assessment,
    va_unaided_mp: result.va_unaided_mp,
    va_unaided_mt: result.va_unaided_mt,
    va_unaided_binocular: result.va_unaided_binocular,
    va_old_mp: result.va_old_mp,
    va_old_mt: result.va_old_mt,
    va_old_binocular: result.va_old_binocular,
    va_new_mp: result.va_new_mp,
    va_new_mt: result.va_new_mt,
    va_new_binocular: result.va_new_binocular,
    sphere_old_mp: n(result.sphere_old_mp),
    cylinder_old_mp: n(result.cylinder_old_mp),
    axis_old_mp: n(result.axis_old_mp),
    sphere_old_mt: n(result.sphere_old_mt),
    cylinder_old_mt: n(result.cylinder_old_mt),
    axis_old_mt: n(result.axis_old_mt),
    sphere_new_mp: n(result.sphere_new_mp),
    cylinder_new_mp: n(result.cylinder_new_mp),
    axis_new_mp: n(result.axis_new_mp),
    sphere_new_mt: n(result.sphere_new_mt),
    cylinder_new_mt: n(result.cylinder_new_mt),
    axis_new_mt: n(result.axis_new_mt),
    clinical_diagnosis: result.clinical_diagnosis,
  };
}

function profileBody(form: ProfileFormPayload) {
  const birthYear = form.birth_year.trim() ? Number.parseInt(form.birth_year.trim(), 10) : null;
  return {
    full_name: form.full_name.trim(),
    birth_year: Number.isInteger(birthYear) ? birthYear : null,
    phone: form.phone.trim(),
    address: form.address.trim(),
  };
}

function resultBody(form: ExamResultFormPayload) {
  const trim = (value: string) => value.trim();
  const optInt = (value: string) => {
    const trimmed = trim(value);
    if (!trimmed) return null;
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isInteger(parsed) ? parsed : null;
  };
  const optNum = (value: string) => {
    const trimmed = trim(value);
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    exam_date: trim(form.exam_date),
    next_appointment_date: trim(form.next_appointment_date) || null,
    quick_medical_assessment: trim(form.quick_medical_assessment),
    va_unaided_mp: trim(form.va_unaided_mp),
    va_unaided_mt: trim(form.va_unaided_mt),
    va_unaided_binocular: trim(form.va_unaided_binocular),
    va_old_mp: trim(form.va_old_mp),
    va_old_mt: trim(form.va_old_mt),
    va_old_binocular: trim(form.va_old_binocular),
    va_new_mp: trim(form.va_new_mp),
    va_new_mt: trim(form.va_new_mt),
    va_new_binocular: trim(form.va_new_binocular),
    sphere_old_mp: optNum(form.sphere_old_mp),
    cylinder_old_mp: optNum(form.cylinder_old_mp),
    axis_old_mp: optInt(form.axis_old_mp),
    sphere_old_mt: optNum(form.sphere_old_mt),
    cylinder_old_mt: optNum(form.cylinder_old_mt),
    axis_old_mt: optInt(form.axis_old_mt),
    sphere_new_mp: optNum(form.sphere_new_mp),
    cylinder_new_mp: optNum(form.cylinder_new_mp),
    axis_new_mp: optInt(form.axis_new_mp),
    sphere_new_mt: optNum(form.sphere_new_mt),
    cylinder_new_mt: optNum(form.cylinder_new_mt),
    axis_new_mt: optInt(form.axis_new_mt),
    clinical_diagnosis: trim(form.clinical_diagnosis),
  };
}

function errorText(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }
  return fallback;
}

function formatDate(value: string | null | undefined) {
  return value || '—';
}

export default function PatientRecordManager({ searchQuery, newEntrySignal, onMessage }: Props) {
  const [view, setView] = useState<View>('list');
  const [profiles, setProfiles] = useState<PatientProfile[]>([]);
  const [selected, setSelected] = useState<PatientProfile | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormPayload>(emptyProfileForm);
  const [resultForm, setResultForm] = useState<ExamResultFormPayload>(emptyResultForm);
  const [editingResultId, setEditingResultId] = useState<number | null>(null);
  const [showResultForm, setShowResultForm] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await api.get<PatientProfile[]>('/admin/patient-records', {
        params: searchQuery.trim() ? { q: searchQuery.trim() } : {},
      });
      setProfiles(res.data);
    } catch {
      setProfiles([]);
      onMessage({ type: 'error', text: 'Không tải được danh sách hồ sơ.' });
    } finally {
      setListLoading(false);
    }
  }, [searchQuery, onMessage]);

  const loadProfile = useCallback(async (id: number) => {
    const res = await api.get<PatientProfile>(`/admin/patient-records/${id}`);
    setSelected(res.data);
    setProfileForm(profileToForm(res.data));
    setView('detail');
    setShowResultForm(false);
    setEditingResultId(null);
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    if (newEntrySignal > 0) {
      setSelected(null);
      setProfileForm(emptyProfileForm());
      setResultForm(emptyResultForm());
      setEditingResultId(null);
      setShowResultForm(true);
      setView('create');
      onMessage(null);
    }
  }, [newEntrySignal, onMessage]);

  const startNew = () => {
    setSelected(null);
    setProfileForm(emptyProfileForm());
    setResultForm(emptyResultForm());
    setEditingResultId(null);
    setShowResultForm(true);
    setView('create');
    onMessage(null);
  };

  const openProfile = async (id: number) => {
    try {
      onMessage(null);
      await loadProfile(id);
    } catch (error) {
      onMessage({ type: 'error', text: errorText(error, 'Không tải được hồ sơ.') });
    }
  };

  const saveInitialProfile = async () => {
    setSaving(true);
    try {
      const res = await api.post<PatientProfile>('/admin/patient-records', {
        ...profileBody(profileForm),
        ...resultBody(resultForm),
      });
      onMessage({ type: 'success', text: 'Đã lưu hồ sơ và kết quả khám đầu tiên.' });
      await fetchList();
      await loadProfile(res.data.id);
    } catch (error) {
      onMessage({ type: 'error', text: errorText(error, 'Không lưu được hồ sơ.') });
    } finally {
      setSaving(false);
    }
  };

  const saveProfileInfo = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await api.put<PatientProfile>(`/admin/patient-records/${selected.id}`, profileBody(profileForm));
      setSelected(res.data);
      setProfileForm(profileToForm(res.data));
      await fetchList();
      onMessage({ type: 'success', text: 'Đã cập nhật thông tin hồ sơ.' });
    } catch (error) {
      onMessage({ type: 'error', text: errorText(error, 'Không cập nhật được hồ sơ.') });
    } finally {
      setSaving(false);
    }
  };

  const startAddResult = () => {
    setResultForm(emptyResultForm());
    setEditingResultId(null);
    setShowResultForm(true);
    onMessage(null);
  };

  const startEditResult = (result: PatientExamResult) => {
    setResultForm(resultToForm(result));
    setEditingResultId(result.id);
    setShowResultForm(true);
    onMessage(null);
  };

  const saveResult = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      if (editingResultId) {
        await api.put(`/admin/patient-records/${selected.id}/results/${editingResultId}`, resultBody(resultForm));
        onMessage({ type: 'success', text: 'Đã cập nhật kết quả khám.' });
      } else {
        await api.post(`/admin/patient-records/${selected.id}/results`, resultBody(resultForm));
        onMessage({ type: 'success', text: 'Đã thêm kết quả khám.' });
      }
      await fetchList();
      await loadProfile(selected.id);
    } catch (error) {
      onMessage({ type: 'error', text: errorText(error, 'Không lưu được kết quả khám.') });
    } finally {
      setSaving(false);
    }
  };

  const deleteResult = async (resultId: number) => {
    if (!selected || !window.confirm('Xóa kết quả khám này?')) return;
    setSaving(true);
    try {
      await api.delete(`/admin/patient-records/${selected.id}/results/${resultId}`);
      onMessage({ type: 'success', text: 'Đã xóa kết quả khám.' });
      await fetchList();
      await loadProfile(selected.id);
    } catch (error) {
      onMessage({ type: 'error', text: errorText(error, 'Không xóa được kết quả khám.') });
    } finally {
      setSaving(false);
    }
  };

  const updateProfileField = (key: keyof ProfileFormPayload, value: string) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateResultField = (key: keyof ExamResultFormPayload, value: string) => {
    setResultForm((prev) => ({ ...prev, [key]: value }));
  };

  const fieldClass =
    'w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#005eb8] focus:ring-2 focus:ring-[#005eb8]/20';

  const profileFields = (
    <section className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-5 shadow-sm">
      <h3 className="font-['Manrope'] text-lg font-bold text-slate-900">Thông tin hồ sơ</h3>
      <p className="mt-1 text-xs text-slate-500">Một số điện thoại chỉ thuộc về duy nhất một hồ sơ bệnh nhân.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-600">
          Họ và tên
          <input value={profileForm.full_name} onChange={(e) => updateProfileField('full_name', e.target.value)} className={`${fieldClass} mt-1.5`} />
        </label>
        <label className="block text-sm font-medium text-slate-600">
          Số điện thoại
          <input type="tel" value={profileForm.phone} onChange={(e) => updateProfileField('phone', e.target.value)} className={`${fieldClass} mt-1.5`} />
        </label>
        <label className="block text-sm font-medium text-slate-600">
          Năm sinh
          <input inputMode="numeric" value={profileForm.birth_year} onChange={(e) => updateProfileField('birth_year', e.target.value)} className={`${fieldClass} mt-1.5`} />
        </label>
        <label className="block text-sm font-medium text-slate-600 sm:col-span-2">
          Địa chỉ
          <textarea rows={3} value={profileForm.address} onChange={(e) => updateProfileField('address', e.target.value)} className={`${fieldClass} mt-1.5 resize-y`} />
        </label>
      </div>
    </section>
  );

  const resultFields = (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-['Manrope'] text-lg font-bold text-slate-900">
            {editingResultId ? 'Sửa kết quả khám' : 'Thêm kết quả khám'}
          </h3>
          <p className="mt-1 text-xs text-slate-500">Mỗi ngày khám trong một hồ sơ chỉ có một kết quả.</p>
        </div>
        {selected ? (
          <button
            type="button"
            onClick={() => {
              setShowResultForm(false);
              setEditingResultId(null);
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Đóng
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-600">
            Ngày khám
            <input type="date" value={resultForm.exam_date} onChange={(e) => updateResultField('exam_date', e.target.value)} className={`${fieldClass} mt-1.5`} />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Ngày hẹn khám tiếp theo
            <input type="date" value={resultForm.next_appointment_date} onChange={(e) => updateResultField('next_appointment_date', e.target.value)} className={`${fieldClass} mt-1.5`} />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Ghi chú lâm sàng
            <textarea rows={5} value={resultForm.quick_medical_assessment} onChange={(e) => updateResultField('quick_medical_assessment', e.target.value)} className={`${fieldClass} mt-1.5 resize-y`} />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Tóm tắt & chẩn đoán
            <textarea rows={5} value={resultForm.clinical_diagnosis} onChange={(e) => updateResultField('clinical_diagnosis', e.target.value)} className={`${fieldClass} mt-1.5 resize-y`} />
          </label>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-bold text-slate-900">Thị lực</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {(['mp', 'mt', 'binocular'] as const).map((eye) => {
                const key = `va_unaided_${eye}` as keyof ExamResultFormPayload;
                return (
                  <label key={key} className="block rounded-2xl bg-blue-50 p-3 text-xs font-semibold text-blue-700">
                    Không kính {eye.toUpperCase()}
                    <input value={resultForm[key]} onChange={(e) => updateResultField(key, e.target.value)} className="mt-2 w-full border-0 bg-transparent text-center text-lg font-bold text-slate-900 outline-none" />
                  </label>
                );
              })}
              {(['old', 'new'] as const).map((mode) =>
                (['mp', 'mt', 'binocular'] as const).map((eye) => {
                  const key = `va_${mode}_${eye}` as keyof ExamResultFormPayload;
                  return (
                    <label key={key} className="block rounded-2xl bg-slate-100 p-3 text-xs font-semibold text-slate-500">
                      {mode === 'old' ? 'Cũ' : 'Mới'} {eye.toUpperCase()}
                      <input value={resultForm[key]} onChange={(e) => updateResultField(key, e.target.value)} className="mt-2 w-full border-0 bg-transparent text-center text-lg font-bold text-slate-900 outline-none" />
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {(['old', 'new'] as const).map((mode) => (
            <div key={mode} className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900">Khúc xạ kính {mode === 'old' ? 'cũ' : 'mới'}</div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="bg-white text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Mắt</th>
                      <th className="px-3 py-2">Sph.</th>
                      <th className="px-3 py-2">Cyl.</th>
                      <th className="px-3 py-2">Axis°</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(['mp', 'mt'] as const).map((eye) => {
                      const sphereKey = `sphere_${mode}_${eye}` as keyof ExamResultFormPayload;
                      const cylinderKey = `cylinder_${mode}_${eye}` as keyof ExamResultFormPayload;
                      const axisKey = `axis_${mode}_${eye}` as keyof ExamResultFormPayload;
                      return (
                        <tr key={`${mode}-${eye}`} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-semibold text-slate-700">{eye.toUpperCase()}</td>
                          <td className="px-2 py-2"><input value={resultForm[sphereKey]} onChange={(e) => updateResultField(sphereKey, e.target.value)} className={fieldClass} /></td>
                          <td className="px-2 py-2"><input value={resultForm[cylinderKey]} onChange={(e) => updateResultField(cylinderKey, e.target.value)} className={fieldClass} /></td>
                          <td className="px-2 py-2"><input value={resultForm[axisKey]} onChange={(e) => updateResultField(axisKey, e.target.value)} className={fieldClass} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={selected ? saveResult : saveInitialProfile}
          disabled={saving}
          className="rounded-xl bg-[#005eb8] px-5 py-2.5 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Đang lưu...' : selected ? (editingResultId ? 'Cập nhật kết quả' : 'Lưu kết quả mới') : 'Lưu hồ sơ'}
        </button>
      </div>
    </section>
  );

  if (view === 'create') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Hồ sơ bệnh nhân / Tạo mới</p>
            <h2 className="mt-1 font-['Manrope'] text-2xl font-extrabold text-slate-900">Tạo hồ sơ và kết quả khám đầu tiên</h2>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setView('list')} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">Hủy</button>
            <button type="button" onClick={saveInitialProfile} disabled={saving} className="rounded-xl bg-[#005eb8] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
            </button>
          </div>
        </div>
        {profileFields}
        {resultFields}
      </div>
    );
  }

  if (view === 'detail' && selected) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button type="button" onClick={() => setView('list')} className="text-sm font-semibold text-[#005eb8]">← Quay lại danh sách</button>
            <h2 className="mt-2 font-['Manrope'] text-2xl font-extrabold text-slate-900">{selected.full_name}</h2>
            <p className="mt-1 text-sm text-slate-600">{selected.phone} · {selected.result_count} kết quả khám</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={saveProfileInfo} disabled={saving} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-60">
              Lưu thông tin hồ sơ
            </button>
            <button type="button" onClick={startAddResult} className="rounded-xl bg-[#005eb8] px-5 py-2.5 text-sm font-semibold text-white">
              + Thêm kết quả khám
            </button>
          </div>
        </div>

        {profileFields}
        {showResultForm ? resultFields : null}

        <section className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-5 shadow-sm">
          <h3 className="font-['Manrope'] text-lg font-bold text-slate-900">Danh sách kết quả theo ngày khám</h3>
          <div className="mt-4 grid gap-3">
            {(selected.results || []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Chưa có kết quả khám.</div>
            ) : (
              (selected.results || []).map((result) => (
                <article key={result.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-['Manrope'] text-lg font-bold text-slate-900">Ngày khám: {formatDate(result.exam_date)}</p>
                      <p className="mt-1 text-sm text-slate-600">{result.clinical_diagnosis || result.quick_medical_assessment || 'Chưa có chẩn đoán'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEditResult(result)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#005eb8]">Sửa</button>
                      <button type="button" onClick={() => deleteResult(result.id)} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">Xóa</button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Hồ sơ bệnh nhân</p>
          <h2 className="mt-1 font-['Manrope'] text-xl font-extrabold text-slate-900 sm:text-2xl">Danh sách hồ sơ</h2>
        </div>
        <button type="button" onClick={startNew} className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#005eb8] px-5 py-2.5 text-sm font-semibold text-white shadow-md sm:min-h-0 sm:w-auto">
          + Tạo hồ sơ mới
        </button>
      </div>

      {listLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#005eb8]/30 border-t-[#005eb8]" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-600">
          {searchQuery.trim() ? 'Không tìm thấy hồ sơ phù hợp.' : 'Chưa có hồ sơ nào. Nhấn “Tạo hồ sơ mới” để thêm bệnh nhân đầu tiên.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {profiles.map((profile) => (
            <article key={profile.id} className="rounded-[20px] border border-slate-200 bg-[#f8fafc] p-5 shadow-sm transition hover:border-[#005eb8]/40">
              <p className="font-['Manrope'] text-lg font-bold text-slate-900">{profile.full_name}</p>
              <p className="mt-1 text-sm text-slate-600">{profile.phone || '—'}</p>
              <p className="mt-2 text-xs text-slate-500">Kết quả: {profile.result_count} · Gần nhất: {formatDate(profile.latest_exam_date)}</p>
              <button type="button" onClick={() => openProfile(profile.id)} className="mt-4 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#005eb8] transition hover:bg-slate-50">
                Mở hồ sơ
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
