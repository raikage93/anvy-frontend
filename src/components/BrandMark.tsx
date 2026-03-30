type Size = 'sm' | 'md' | 'lg';

type Props = {
  size?: Size;
  className?: string;
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-16 w-16',
};

export default function BrandMark({ size = 'md', className = '' }: Props) {
  return (
    <div className={[sizeClasses[size], className].join(' ')}>
      <img
        src="/image/logo-anvy.svg"
        alt="AnVy Clinic"
        className="h-full w-full object-contain"
      />
    </div>
  );
}
