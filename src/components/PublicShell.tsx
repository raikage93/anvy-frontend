import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BrandMark from './BrandMark';

type PublicPageKey = 'home' | 'services' | 'eyewear' | 'booking' | 'wheel';

type Props = {
  active: PublicPageKey;
  children: ReactNode;
};

const navItems: Array<{ key: PublicPageKey; label: string; to: string }> = [
  { key: 'home', label: 'Trang chủ', to: '/' },
  { key: 'services', label: 'Dịch vụ', to: '/services' },
  { key: 'eyewear', label: 'Gọng kính', to: '/eyewear' },
  { key: 'wheel', label: 'Vòng quay', to: '/lucky-wheel' },
  { key: 'booking', label: 'Đặt lịch', to: '/booking' },
];

export default function PublicShell({ active, children }: Props) {
  const { user } = useAuth();

  return (
    <div className="min-h-dvh bg-[#f7f9fb] text-[#191c1e]">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center">
            <BrandMark size="md" className="shrink-0" />
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className={`border-b-2 pb-1 font-['Manrope'] text-sm font-bold tracking-tight transition-colors ${
                  active === item.key
                    ? 'border-[#00478d] text-[#00478d]'
                    : 'border-transparent text-slate-500 hover:text-[#005eb8]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <Link
              to="/payment"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Thanh toán
            </Link>
            {user?.role === 'admin' ? (
              <Link
                to="/admin"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Quản trị
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Đăng nhập
              </Link>
            )}
            <Link
              to="/booking"
              className="rounded-full bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] px-5 py-2.5 text-sm font-['Manrope'] font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:opacity-95"
            >
              Đặt lịch
            </Link>
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-200 bg-[#f2f4f6]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] lg:px-8">
          <div>
            <div className="flex items-center">
              <BrandMark size="md" />
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
              Trải nghiệm hệ thống chăm sóc mắt chuyên sâu với quy trình chuẩn y khoa, lịch hẹn linh hoạt và dịch vụ tư vấn tận tâm.
            </p>
          </div>

          <div>
            <p className="font-['Manrope'] text-sm font-extrabold uppercase tracking-[0.2em] text-slate-900">Khám phá</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {navItems.map((item) => (
                <Link key={item.key} to={item.to} className="block transition hover:text-[#00478d]">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="font-['Manrope'] text-sm font-extrabold uppercase tracking-[0.2em] text-slate-900">Hỗ trợ</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <Link to="/payment" className="block transition hover:text-[#00478d]">
                Thanh toán
              </Link>
              <Link to="/login" className="block transition hover:text-[#00478d]">
                Đăng nhập
              </Link>
              <a href="tel:19001234" className="block transition hover:text-[#00478d]">
                1900 1234
              </a>
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-sm">
            <p className="font-['Manrope'] text-lg font-extrabold text-slate-900">Đặt lịch khám nhanh</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Chọn khung giờ còn trống trong tuần và gửi yêu cầu trực tiếp tới phòng khám.
            </p>
            <Link
              to="/booking"
              className="mt-5 inline-flex rounded-full bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] px-5 py-2.5 text-sm font-['Manrope'] font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:opacity-95"
            >
              Mở trang đặt lịch
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
