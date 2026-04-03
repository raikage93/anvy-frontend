import type { AvailabilitySetting } from '../types';

type Props = {
  settings: AvailabilitySetting[];
  compact?: boolean;
};

function formatRange(setting: AvailabilitySetting) {
  if (!setting.enabled || !setting.start_time || !setting.end_time) {
    return 'Nghỉ';
  }

  return `${setting.start_time} - ${setting.end_time}`;
}

export default function AvailabilitySummary({ settings, compact = false }: Props) {
  return (
    <div className={`grid gap-3 ${compact ? 'sm:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-4'}`}>
      {settings.map((setting) => (
        <div
          key={setting.weekday}
          className={`rounded-2xl border px-4 py-3 ${
            setting.enabled
              ? 'border-blue-200 bg-blue-50/60'
              : 'border-slate-200 bg-slate-100/70'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">{setting.label}</p>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                setting.enabled
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {setting.enabled ? 'Mở lịch' : 'Đóng'}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{formatRange(setting)}</p>
        </div>
      ))}
    </div>
  );
}
