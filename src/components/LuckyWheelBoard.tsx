import type { WheelPrize } from '../types';

type Props = {
  prizes: WheelPrize[];
  rotation: number;
  isSpinning: boolean;
  spinDurationMs?: number;
  onSpin?: () => void;
  spinDisabled?: boolean;
  buttonLabel?: string;
  helperText?: string;
};

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function buildArcPath(startAngle: number, endAngle: number, radius = 46) {
  if (Math.abs(endAngle - startAngle) >= 359.9) {
    return `M 50 4 A ${radius} ${radius} 0 1 1 49.99 4 Z`;
  }

  const start = polarToCartesian(50, 50, radius, endAngle);
  const end = polarToCartesian(50, 50, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return `M 50 50 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

function buildLabelArcPath(startAngle: number, endAngle: number, radius: number, reverse = false) {
  const fromAngle = reverse ? endAngle : startAngle;
  const toAngle = reverse ? startAngle : endAngle;
  const start = polarToCartesian(50, 50, radius, fromAngle);
  const end = polarToCartesian(50, 50, radius, toAngle);
  const largeArcFlag = Math.abs(toAngle - fromAngle) <= 180 ? '0' : '1';
  const sweepFlag = reverse ? '0' : '1';

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
}

function getTextColor(hexColor: string) {
  const normalized = hexColor.replace('#', '');
  const full = normalized.length === 3 ? normalized.split('').map((char) => char + char).join('') : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return '#ffffff';
  }

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.7 ? '#0f172a' : '#ffffff';
}

function shortenLabel(value: string) {
  return value.length > 16 ? `${value.slice(0, 15)}…` : value;
}

export default function LuckyWheelBoard({
  prizes,
  rotation,
  isSpinning,
  spinDurationMs = 4600,
  onSpin,
  spinDisabled = false,
  buttonLabel = 'Quay ngay',
  helperText,
}: Props) {
  const segmentAngle = prizes.length ? 360 / prizes.length : 360;
  const labelRadius = prizes.length <= 4 ? 34 : prizes.length <= 6 ? 35.5 : 36.5;
  const labelInset = Math.min(8, segmentAngle * 0.16);

  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[38%]">
        <svg viewBox="0 0 92 122" className="h-[110px] w-[84px] drop-shadow-[0_22px_26px_rgba(15,23,42,0.22)]">
          <defs>
            <linearGradient id="pointer-shell" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#bfdbfe" />
            </linearGradient>
            <linearGradient id="pointer-core" x1="15%" y1="10%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#41c7f2" />
              <stop offset="52%" stopColor="#0c74d4" />
              <stop offset="100%" stopColor="#00478d" />
            </linearGradient>
            <linearGradient id="pointer-tip" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <filter id="pointer-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          <ellipse cx="46" cy="30" rx="24" ry="24" fill="#005eb8" opacity="0.14" filter="url(#pointer-glow)" />
          <path
            d="M46 10C61.464 10 74 22.536 74 38C74 48.207 68.537 57.143 60.38 62.023L50.99 84.451C49.976 86.873 42.024 86.873 41.01 84.451L31.62 62.023C23.463 57.143 18 48.207 18 38C18 22.536 30.536 10 46 10Z"
            fill="url(#pointer-shell)"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="1.2"
          />
          <circle cx="46" cy="38" r="17" fill="url(#pointer-core)" />
          <circle cx="46" cy="38" r="7.5" fill="#ffffff" opacity="0.92" />
          <ellipse cx="39" cy="30" rx="8" ry="4.5" fill="#ffffff" opacity="0.28" transform="rotate(-28 39 30)" />
          <path
            d="M46 84L58 78L52 108C50.941 112.703 41.059 112.703 40 108L34 78L46 84Z"
            fill="url(#pointer-tip)"
          />
          <path
            d="M46 86L53.5 82.5L49.5 102.5C48.966 105.164 43.034 105.164 42.5 102.5L38.5 82.5L46 86Z"
            fill="#0c74d4"
          />
          <circle cx="46" cy="38" r="27.5" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.4" />
        </svg>
      </div>

      <div className="rounded-[40px] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.12)] sm:p-6">
        <div className="relative aspect-square">
          <div
            className="absolute inset-0 rounded-full transition-transform duration-[4600ms] ease-[cubic-bezier(0.12,0.8,0.22,1)]"
            style={{ transform: `rotate(${rotation}deg)`, transitionDuration: `${spinDurationMs}ms` }}
          >
            <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_30px_45px_rgba(15,23,42,0.18)]">
              <circle cx="50" cy="50" r="48" fill="#fff7ed" />
              <defs>
                {prizes.map((prize, index) => {
                  const startAngle = index * segmentAngle + labelInset;
                  const endAngle = (index + 1) * segmentAngle - labelInset;
                  const midAngle = index * segmentAngle + segmentAngle / 2;
                  const reverse = midAngle > 90 && midAngle < 270;

                  return (
                    <path
                      key={`label-path-${prize.id}`}
                      id={`wheel-label-path-${prize.id}`}
                      d={buildLabelArcPath(startAngle, endAngle, labelRadius, reverse)}
                    />
                  );
                })}
              </defs>
              {prizes.map((prize, index) => {
                const startAngle = index * segmentAngle;
                const endAngle = startAngle + segmentAngle;
                const textColor = getTextColor(prize.color);

                return (
                  <g key={prize.id}>
                    <path d={buildArcPath(startAngle, endAngle)} fill={prize.color} stroke="#ffffff" strokeWidth="1.2" />
                    <text
                      textAnchor="middle"
                      fontSize={prizes.length <= 4 ? '4.4' : prizes.length <= 6 ? '3.8' : '3.2'}
                      fontWeight="800"
                      fill={textColor}
                      fontFamily="Inter, sans-serif"
                      letterSpacing="0.02em"
                    >
                      <textPath href={`#wheel-label-path-${prize.id}`} startOffset="50%">
                        {shortenLabel(prize.name)}
                      </textPath>
                    </text>
                  </g>
                );
              })}
              <circle cx="50" cy="50" r="18" fill="#ffffff" stroke="#dbeafe" strokeWidth="3" />
              <circle cx="50" cy="50" r="11" fill="#005eb8" />
              <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.95" />
            </svg>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={onSpin}
              disabled={spinDisabled || isSpinning || prizes.length === 0}
              className="flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-white bg-[linear-gradient(135deg,#00478d_0%,#0c74d4_100%)] text-center shadow-[0_20px_40px_rgba(0,94,184,0.35)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-55"
            >
              <span className="font-['Manrope'] text-lg font-extrabold text-white">{isSpinning ? 'Đang quay' : buttonLabel}</span>
            </button>
          </div>
        </div>

        {helperText ? <p className="mt-5 text-center text-sm text-slate-500">{helperText}</p> : null}
      </div>
    </div>
  );
}
