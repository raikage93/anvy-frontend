import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AvailabilityModal from '../components/AvailabilityModal';
import PublicShell from '../components/PublicShell';
import api from '../services/api';
import type { AvailabilitySetting } from '../types';

const heroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAtTipZkFoB_YOIZALkyAmnt89SATnkULXVTmQRn7zolJr5P-7ZlsaR67uXs6BEY7Nq3SDqT09J3gHi3Lf22Gf1CkIrgVP0fJARCgEfHJPBDHUGbprVRCth0ujE4UH_9Wak4LfsQ1IPbxbnPy6Bu5Xh6LeX1rMdznZbxnBa4oimLLhsV9hE15ZxQzp3H5KXjhAIR2cqxj8GgV2vVusDnCGbC5WC9um2q-iMD7lsO_owygwIPDM7i8qTRgOMHvn2nD3YNTvqExhlm_cA';

const doctorImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDOblpVCI8mU9co6y_dcGmnuEhn_juLAzhQVyHEnh77MCN1wgu_yvaDeGtEEVE4Pt-9g3MXawyxVSlGZ3bJuXu-QBQRMMVPWnxWln4nmuN_5A6GwxflKJPl8Dk7L4_Euz_i1qsZhWmR0HZI46a8lH8Tv0zO_DOZWCek13a0Jyv6GKUTqc25aAcdgT1rSJjfDei4HgWCZ6fCsHyf-vPTCVJx6HRwtY2sxFl2l5BRFllPuYfl-9sSj1leAjBjgJ7mvmhkLUc6XTAah3Uh';

const serviceCards = [
  {
    title: 'Đo mắt kỹ thuật số',
    description:
      'Ứng dụng thiết bị khúc xạ thế hệ mới để đo chính xác, nhanh và giảm sai số khi kiểm tra thị lực.',
  },
  {
    title: 'Cắt kính kỹ thuật',
    description:
      'Gia công tròng kính tối ưu theo nhu cầu nhìn xa, nhìn gần, làm việc màn hình hoặc lái xe ban đêm.',
  },
  {
    title: 'Tư vấn gọng kính',
    description:
      'Phối hợp yếu tố thẩm mỹ, khuôn mặt và độ dày tròng để chọn gọng kính vừa đẹp vừa dễ đeo lâu dài.',
  },
];

const partners = ['ESSILOR', 'ZEISS', 'Ray·Ban', 'Vogue', 'GUCCI'];

const doctorFeatures = [
  'Khám sàng lọc bệnh lý mắt toàn diện',
  'Tư vấn kiểm soát cận thị cho trẻ em',
  'Theo dõi sức khỏe mắt định kỳ theo hồ sơ',
];

const testimonials = [
  {
    name: 'Ngọc Linh',
    quote:
      'Quy trình khám rất nhẹ nhàng, bác sĩ giải thích kỹ và phần đặt lịch online giúp mình chủ động thời gian hơn hẳn.',
  },
  {
    name: 'Khánh Duy',
    quote:
      'Máy móc hiện đại, không gian sáng và chuyên nghiệp. Mình đặt lịch trước nên tới nơi gần như được tiếp nhận ngay.',
  },
  {
    name: 'Minh Anh',
    quote:
      'Tư vấn tròng kính rất kỹ, không bị bán hàng quá mức. Mình thích nhất là website cho xem lịch làm việc rất rõ ràng.',
  },
];

export default function HomePage() {
  const [availability, setAvailability] = useState<AvailabilitySetting[]>([]);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.get('/availability');
        setAvailability(res.data);
      } catch {
        setAvailability([]);
      }
    };

    fetchAvailability();
  }, []);

  return (
    <PublicShell active="home">
      <section className="overflow-hidden bg-[#f2f4f6]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <span className="mb-5 block text-xs font-bold uppercase tracking-[0.32em] text-[#00478d]">
              Clinical Excellence & Style
            </span>
            <h1 className="max-w-3xl font-['Manrope'] text-5xl font-extrabold leading-[1.04] tracking-[-0.04em] text-slate-900 sm:text-6xl lg:text-7xl">
              Chăm sóc đôi mắt của bạn với sự <span className="text-[#00478d]">tận tâm</span> và{' '}
              <span className="text-[#775a19]">chuyên nghiệp</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Trải nghiệm hệ thống chăm sóc mắt chuẩn y khoa với công nghệ đo khám hiện đại, đội ngũ bác sĩ giàu kinh
              nghiệm và quy trình đặt lịch online gọn gàng cho mọi thiết bị.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/booking"
                className="rounded-full bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] px-7 py-3.5 text-center font-['Manrope'] text-base font-extrabold text-white shadow-lg shadow-blue-900/20 transition hover:opacity-95"
              >
                Đặt lịch khám ngay
              </Link>
              <Link
                to="/eyewear"
                className="rounded-full bg-[#ffdea5] px-7 py-3.5 text-center font-['Manrope'] text-base font-extrabold text-[#261900] transition hover:brightness-95"
              >
                Xem bộ sưu tập kính
              </Link>
              <button
                type="button"
                onClick={() => setIsAvailabilityOpen(true)}
                className="rounded-full border border-slate-300 bg-white px-7 py-3.5 text-center font-['Manrope'] text-base font-bold text-slate-700 transition hover:border-[#00478d] hover:text-[#00478d]"
              >
                Xem lịch trong tuần
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#005eb8]/10 blur-3xl" />
            <div className="absolute -bottom-8 -right-8 h-44 w-44 rounded-full bg-[#ffdea5]/35 blur-3xl" />
            <div className="relative overflow-hidden rounded-[32px] shadow-2xl shadow-slate-900/10">
              <img src={heroImage} alt="AnVy Clinic" className="aspect-[4/5] w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="font-['Manrope'] text-4xl font-extrabold tracking-[-0.03em] text-slate-900">Dịch vụ nổi bật</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Trải nghiệm quy trình chăm sóc mắt chuẩn y khoa với thiết bị hiện đại và đội ngũ tư vấn chuyên sâu.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {serviceCards.map((service, index) => (
              <article
                key={service.title}
                className="rounded-[28px] border border-slate-200 bg-[#f7f9fb] p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d6e3ff] font-['Manrope'] text-lg font-extrabold text-[#00478d]">
                  0{index + 1}
                </div>
                <h3 className="mt-6 font-['Manrope'] text-2xl font-extrabold tracking-tight text-slate-900">
                  {service.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{service.description}</p>
                <Link to="/services" className="mt-6 inline-flex text-sm font-bold text-[#00478d] transition hover:text-[#005eb8]">
                  Tìm hiểu thêm
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f2f4f6] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-10 text-center text-xs font-bold uppercase tracking-[0.34em] text-slate-500">Đối tác chiến lược</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-xl font-['Manrope'] font-black tracking-tight text-slate-500 sm:gap-14 sm:text-2xl">
            {partners.map((partner) => (
              <span key={partner}>{partner}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
          <div className="relative">
            <div className="overflow-hidden rounded-[32px] shadow-2xl shadow-slate-900/10">
              <img src={doctorImage} alt="Đội ngũ bác sĩ AnVy Clinic" className="aspect-square w-full object-cover" />
            </div>
            <div className="absolute -bottom-8 right-6 max-w-[240px] rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl">
              <p className="font-['Manrope'] text-4xl font-extrabold text-[#00478d]">15+</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Năm kinh nghiệm trong lĩnh vực khúc xạ nhãn khoa và chăm sóc thị lực chuyên sâu.
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-['Manrope'] text-4xl font-extrabold leading-tight tracking-[-0.03em] text-slate-900 sm:text-5xl">
              Đội ngũ bác sĩ tâm huyết & giàu kinh nghiệm
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Mỗi buổi khám đều được thực hiện với sự tỉ mỉ, giải thích rõ ràng và ưu tiên tối đa trải nghiệm của bệnh
              nhân, từ trẻ nhỏ tới người lớn tuổi.
            </p>

            <div className="mt-8 space-y-4">
              {doctorFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d6e3ff] text-xs font-bold text-[#00478d]">
                    ✓
                  </div>
                  <p className="text-base font-medium text-slate-800">{feature}</p>
                </div>
              ))}
            </div>

            <Link
              to="/services"
              className="mt-10 inline-flex rounded-full border-2 border-[#00478d] px-7 py-3.5 font-['Manrope'] text-base font-extrabold text-[#00478d] transition hover:bg-[#00478d] hover:text-white"
            >
              Tìm hiểu về đội ngũ
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#f2f4f6] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-['Manrope'] text-4xl font-extrabold tracking-[-0.03em] text-slate-900">
                Khách hàng nói gì về chúng tôi
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Sự hài lòng của khách hàng là thước đo quan trọng nhất cho chất lượng dịch vụ tại AnVy Clinic.
              </p>
            </div>
            <Link to="/booking" className="text-sm font-bold text-[#00478d] transition hover:text-[#005eb8]">
              Đặt lịch trải nghiệm
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="rounded-[28px] bg-white p-8 shadow-sm">
                <div className="mb-5 flex gap-1 text-[#e9c176]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={`${item.name}-${index}`}>★</span>
                  ))}
                </div>
                <p className="text-base leading-8 text-slate-700">“{item.quote}”</p>
                <p className="mt-6 font-['Manrope'] text-lg font-extrabold text-slate-900">{item.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] px-6 py-12 text-white shadow-2xl shadow-blue-900/20 sm:px-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.34em] text-blue-100">Ready to book</p>
                <h2 className="mt-4 font-['Manrope'] text-4xl font-extrabold leading-tight tracking-[-0.03em] sm:text-5xl">
                  Đặt lịch online để được tiếp nhận nhanh hơn tại phòng khám
                </h2>
                <p className="mt-4 text-base leading-8 text-blue-50/90">
                  Chọn ngày phù hợp, xem lịch tuần và gửi yêu cầu đặt khám trực tiếp tới hệ thống của AnVy Clinic.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/booking"
                  className="rounded-full bg-white px-7 py-3.5 text-center font-['Manrope'] text-base font-extrabold text-[#00478d] transition hover:bg-slate-100"
                >
                  Đi tới trang đặt lịch
                </Link>
                <button
                  type="button"
                  onClick={() => setIsAvailabilityOpen(true)}
                  className="rounded-full border border-white/25 px-7 py-3.5 text-center font-['Manrope'] text-base font-extrabold text-white transition hover:bg-white/10"
                >
                  Xem lịch tuần này
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AvailabilityModal
        isOpen={isAvailabilityOpen}
        onClose={() => setIsAvailabilityOpen(false)}
        settings={availability}
      />
    </PublicShell>
  );
}
