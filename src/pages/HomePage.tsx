import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import heroImage from '../assets/hero.png';
import { useAuth } from '../hooks/useAuth';
import BookingModal from '../components/BookingModal';
import BrandMark from '../components/BrandMark';
import AvailabilityModal from '../components/AvailabilityModal';
import api from '../services/api';
import type { AvailabilitySetting } from '../types';

const services = [
  {
    title: 'Khám và tư vấn',
    description: 'Đánh giá tình trạng hiện tại, tư vấn hướng điều trị rõ ràng và phù hợp.',
  },
  {
    title: 'Theo dõi lịch hẹn',
    description: 'Đặt lịch trước để giảm thời gian chờ và chủ động sắp xếp khung giờ.',
  },
  {
    title: 'Chăm sóc sau khám',
    description: 'Nhận hướng dẫn sau thăm khám và kế hoạch tái khám khi cần thiết.',
  },
];

const highlights = [
  'Khung giờ linh hoạt cho khách đặt lịch trước',
  'Quy trình tiếp nhận ngắn gọn, dễ thao tác trên điện thoại',
  'Thông tin lịch hẹn được gửi trực tiếp về hệ thống phòng khám',
];

export default function HomePage() {
  const { user } = useAuth();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySetting[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.get('/availability');
        setAvailability(res.data);
      } catch {
        setAvailability([]);
      } finally {
        setAvailabilityLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_35%),linear-gradient(180deg,_#020617_0%,_#0f172a_48%,_#020617_100%)] text-text">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/65 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark size="md" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-light sm:text-xs sm:tracking-[0.28em]">AnVy Clinic</p>
              <h1 className="text-base font-semibold text-white sm:text-lg">Phòng khám thông tin và đặt lịch</h1>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            <Link
              to="/payment"
              className="inline-flex rounded-full border border-white/10 px-3.5 py-2 text-sm text-text-muted transition hover:border-white/25 hover:text-white sm:px-4"
            >
              Thanh toán
            </Link>
            {user?.role === 'admin' ? (
              <Link
                to="/admin"
                className="inline-flex rounded-full border border-white/10 px-3.5 py-2 text-sm text-text-muted transition hover:border-white/25 hover:text-white sm:px-4"
              >
                Quản trị
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex rounded-full border border-white/10 px-3.5 py-2 text-sm text-text-muted transition hover:border-white/25 hover:text-white sm:px-4"
              >
                Đăng nhập
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsBookingOpen(true)}
              className="flex-1 rounded-full bg-linear-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:opacity-95 sm:flex-none"
            >
              Đặt lịch ngay
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-light sm:text-sm sm:tracking-[0.34em]">
              Chăm sóc gần gũi, đặt lịch nhanh gọn
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight text-white sm:mt-5 sm:text-5xl">
              Trang chủ mới cho phòng khám, tập trung vào thông tin và hẹn lịch khám.
            </h2>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-300 sm:mt-6 sm:text-lg sm:leading-8">
              Người dùng có thể xem nhanh thông tin phòng khám, quy trình tiếp nhận và đặt lịch ngay trên một modal
              gọn nhẹ. Luồng thanh toán QR được giữ lại ở trang riêng để vẫn dùng khi cần.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => setIsBookingOpen(true)}
                className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 sm:w-auto"
              >
                Mở form đặt lịch
              </button>
              <button
                type="button"
                onClick={() => setIsAvailabilityOpen(true)}
                className="w-full rounded-full border border-cyan-300/20 bg-cyan-300/8 px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/35 hover:bg-cyan-300/12 sm:w-auto"
              >
                Xem lịch trong tuần
              </button>
              <Link
                to="/payment"
                className="w-full rounded-full border border-white/15 px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5 sm:w-auto"
              >
                Đi tới trang thanh toán
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-2 -top-2 h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl sm:-left-4 sm:-top-4 sm:h-32 sm:w-32" />
            <div className="absolute -bottom-2 -right-2 h-28 w-28 rounded-full bg-blue-500/20 blur-3xl sm:-bottom-4 sm:-right-4 sm:h-40 sm:w-40" />
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-cyan-950/20">
              <img
                src={heroImage}
                alt="AnVy Clinic"
                className="h-[320px] w-full rounded-[24px] object-cover sm:h-[440px]"
              />
              <div className="mt-4 rounded-[28px] border border-white/10 bg-slate-950/75 p-4 backdrop-blur sm:absolute sm:inset-x-8 sm:bottom-8 sm:mt-0 sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-light sm:text-xs sm:tracking-[0.28em]">Tiếp nhận thông minh</p>
                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-2xl font-black text-white sm:text-3xl">Đặt lịch trong ít phút</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300 sm:max-w-md">
                      Chọn khung giờ khám, để lại số điện thoại và ghi chú nếu cần tư vấn trước.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 sm:w-auto"
                  >
                    Bắt đầu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:pb-18">
          <div className="grid gap-4 md:grid-cols-3">
            {services.map((service, index) => (
              <article
                key={service.title}
                className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-950/15"
              >
                <p className="text-sm font-semibold text-accent-light">0{index + 1}</p>
                <h3 className="mt-4 text-2xl font-semibold text-white">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <div className="rounded-[30px] border border-white/10 bg-slate-950/65 p-5 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent-light">Lịch làm việc phòng khám</p>
                <h3 className="mt-3 text-2xl font-black text-white sm:text-3xl">Khung giờ user được phép chọn luôn đi theo thiết lập của admin</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  Khi admin đóng một ngày hoặc đổi giờ làm việc, modal đặt lịch sẽ cập nhật theo ngay. User sẽ không thể chọn ngoài lịch này.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAvailabilityOpen(true)}
                className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/5"
              >
                Xem lịch trong tuần
              </button>
            </div>

            <div className="mt-6">
              {availabilityLoading ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-cyan-400/20 border-t-cyan-300" />
                </div>
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm leading-7 text-slate-300">
                  Bấm vào <span className="font-semibold text-white">“Xem lịch trong tuần”</span> để mở modal hiển thị lịch khám khả dụng của phòng khám.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[30px] border border-white/10 bg-slate-950/65 p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent-light">Quy trình tiếp nhận</p>
            <div className="mt-6 space-y-6">
              <div>
                <p className="text-lg font-semibold text-white">1. Gửi yêu cầu đặt lịch</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Bạn nhập số điện thoại, chọn thời gian mong muốn và thêm ghi chú trong modal đặt lịch.
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">2. Phòng khám xác nhận</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Thông tin sẽ được đẩy vào hệ thống nội bộ để nhân viên liên hệ xác nhận lịch khám.
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">3. Tiếp nhận tại phòng khám</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Quy trình tiếp nhận gọn gàng hơn vì khung giờ và thông tin cơ bản đã được ghi nhận từ trước.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-cyan-400/15 bg-linear-to-br from-cyan-400/10 via-white/5 to-primary/10 p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent-light">Mối quan tâm chính</p>
            <h3 className="mt-4 text-2xl font-black text-white sm:text-3xl">Một trang chủ đúng vai trò của phòng khám</h3>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-200">
              Thay vì đưa người dùng vào luồng chuyển khoản ngay lập tức, trang chủ mới ưu tiên thông tin, tạo niềm tin và
              dẫn họ vào hành động đặt lịch. Luồng thanh toán vẫn tồn tại ở trang riêng khi cần giao dịch.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <p className="text-4xl font-black text-white">24/7</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Có thể gửi yêu cầu đặt lịch bất cứ lúc nào trên website.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <p className="text-4xl font-black text-white">1 modal</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Nhanh gọn, dùng 3 trường cần thiết: số điện thoại, lịch hẹn, ghi chú.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBookingOpen(true)}
              className="mt-8 inline-flex w-full justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 sm:w-auto"
            >
              Thử đặt lịch ngay
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>AnVy Clinic · Trang thông tin phòng khám và đặt lịch khám</p>
          <div className="flex items-center gap-4">
            <Link to="/payment" className="transition hover:text-white">Thanh toán QR</Link>
            <button type="button" onClick={() => setIsBookingOpen(true)} className="transition hover:text-white">
              Đặt lịch
            </button>
          </div>
        </div>
      </footer>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        availability={availability}
      />
      <AvailabilityModal
        isOpen={isAvailabilityOpen}
        onClose={() => setIsAvailabilityOpen(false)}
        settings={availability}
      />
    </div>
  );
}
