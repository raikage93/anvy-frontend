type Size = 'sm' | 'md' | 'lg';

type Props = {
  size?: Size;
  className?: string;
  /**
   * Đặt true khi logo nằm trên nền tối (dark background).
   * Sẽ bọc logo trong một "badge" trắng glassmorphism cho đẹp.
   */
  darkBg?: boolean;
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-[44px] w-[44px]',
  md: 'h-[72px] w-[72px]',
  lg: 'h-48 w-48',
};

const badgePadding: Record<Size, string> = {
  sm: 'p-1 rounded-xl',
  md: 'p-1.5 rounded-xl',
  lg: 'p-3 rounded-3xl',
};

export default function BrandMark({ size = 'md', className = '', darkBg = false }: Props) {
  if (darkBg) {
    return (
      <div className={['shrink-0', className].join(' ')}>
        <div
          className={[
            sizeClasses[size],
            badgePadding[size],
            'bg-white shadow-xl shadow-black/30 ring-1 ring-white/20',
            'flex items-center justify-center',
          ].join(' ')}
        >
          <img
            src="/image/logo-best-transparent.png"
            alt="AnVy Clinic"
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={[sizeClasses[size], 'shrink-0', className].join(' ')}>
      <img
        src="/image/logo-best-transparent.png"
        alt="AnVy Clinic"
        className="h-full w-full object-contain"
        style={{ mixBlendMode: 'multiply' }}
      />
    </div>
  );
}
