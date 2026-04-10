import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BrandMark from './BrandMark';

type PublicPageKey = 'home' | 'services' | 'eyewear' | 'records' | 'booking' | 'wheel';

type Props = {
  active: PublicPageKey;
  children: ReactNode;
};

const navItems: Array<{ key: PublicPageKey; label: string; to: string }> = [
  { key: 'home', label: 'Trang chủ', to: '/' },
  { key: 'services', label: 'Dịch vụ', to: '/services' },
  { key: 'eyewear', label: 'Gọng kính', to: '/eyewear' },
  { key: 'wheel', label: 'Vòng quay', to: '/lucky-wheel' },
  { key: 'records', label: 'Kết quả khám', to: '/patient-records' },
  { key: 'booking', label: 'Đặt lịch', to: '/booking' },
];

export default function PublicShell({ active, children }: Props) {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#f7f9fb] pb-[env(safe-area-inset-bottom)] text-[#191c1e]">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <nav className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
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

            <div className="hidden flex-wrap items-center justify-end gap-2 md:flex sm:gap-3">
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

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-900 md:hidden"
              aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <span className="text-xl leading-none">{isMobileMenuOpen ? '×' : '☰'}</span>
            </button>
          </div>

          {isMobileMenuOpen ? (
            <div className="mt-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 md:hidden">
              <div className="grid gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    to={item.to}
                    className={`rounded-2xl px-4 py-3 font-['Manrope'] text-sm font-bold transition ${
                      active === item.key
                        ? 'bg-[#dbeafe] text-[#00478d]'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#005eb8]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 grid gap-2">
                <Link
                  to="/payment"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Thanh toán
                </Link>
                {user?.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Quản trị
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Đăng nhập
                  </Link>
                )}
                <Link
                  to="/booking"
                  className="rounded-2xl bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] px-4 py-3 text-center text-sm font-['Manrope'] font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:opacity-95"
                >
                  Đặt lịch
                </Link>
              </div>
            </div>
          ) : null}
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
