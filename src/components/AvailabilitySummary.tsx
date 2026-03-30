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
              ? 'border-cyan-400/20 bg-cyan-400/8'
              : 'border-white/10 bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">{setting.label}</p>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                setting.enabled
                  ? 'bg-cyan-400/12 text-cyan-200'
                  : 'bg-white/8 text-slate-400'
              }`}
            >
              {setting.enabled ? 'Mở lịch' : 'Đóng'}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-300">{formatRange(setting)}</p>
        </div>
      ))}
    </div>
  );
}
