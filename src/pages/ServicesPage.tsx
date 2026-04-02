import { Link } from 'react-router-dom';
import PublicShell from '../components/PublicShell';

const equipmentImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBdzPjapBZHIGbParQOOGKgdkanRrIBBVYgTOZBto_Ow_nAP0pgk5eqySA6K6aqDGsJ_PNg44oBital5bKMqreBXNLLI1os-8O20XdfKz76_jeYheY7zExx8CKbMIaU3oJhzOLBa4mFkBHVdV7r-MulFYm4g99lY81j_WVrpoIUybOuqh9kvYhlcweu8kEilJtcyrcK6qIBqkt0OoSdpfv3EZviwX1lxZc1hvYRAPPOSEYKHzcYYLfeUR88eY7VQfRNY-LzgNVrJBem',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDNshEOrqw8lCqQK13TS68KRnPBj3fUTwV2iKq8HQWxHhznEhMclr5D0jDSdf23760lpgfD9rzk9vpcxw8lhaakMykkrONY0tt1KbV-jkz68VZLHgt1D-Yu-OhpiPqjRbC-0BY6Om1zlrwgkhMbHu-Wurv8xNAWsCzFz31nnBT04Q20NrDHRWegBTYjYv52SfHOoiPdEU1MA7jXuG2oZFNbdQMg_7V6txxKZqGGJfWfeDfQTnhDViL8UMwqQ-0KMGpipLpoYR4DVMcV',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuACIfkTiT6QcvflF9H2hwRetyMnvBMp9yGLgXZM1K5oDSXaaM1t32DLxMmMKrsOqOhRDfOi8n0sbJLzop-Zvn66mq_00cQy7M_y2eES2DX3csCqV7yyE6SuM8qZTGIgOGDRWNCsSFQysVJ1mFXxDrVbQoo4fLwxhzh9-t20jfeWz84mZZX7ptBUFeVW4EZL6aI7Z09iin6mlz7DpFQot3_J120LqcjhOsadunJJgzK1KvOe5AUZLvMg9M4WI0EnB5sS7z7wfgdNhCLm',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAl7WYKvTvd18XMGY2BzcR3zBj1nkJ7JvLwb1eHliUW6yRzk1GZn8UqJgz5kN5ehKtIqz_HqU7Z66vCZTxSUQmzYDncB9puO8LMy0ZPGkLmTa9WM61IgzVfMm7C6IU29d0-0HU8qFg0lxJHqEUCqXAOiT_wKBGBVExd9Rntm0CoLZIKVqVuX_cIHfZthonSoetnEJ0VTNpvFJcceUbNCdKi7OpJFteOkYzMeMCz0gS9dxcEOf30-cmVlTgFYx6iL_5Thgpm-PMO-PJU',
];

const processSteps = [
  ['01', 'Khai thác tiền sử', 'Lắng nghe thói quen sinh hoạt, thời gian dùng màn hình và các vấn đề thị lực hiện tại.'],
  ['02', 'Khúc xạ máy', 'Đo tự động bằng hệ thống mới để ghi nhận nhanh thông số thị lực ban đầu.'],
  ['03', 'Thử thị lực thực tế', 'Tinh chỉnh kết quả với bảng thị lực và thử kính để đảm bảo cảm giác đeo thoải mái.'],
  ['04', 'Khám bệnh lý', 'Kiểm tra bề mặt nhãn cầu, giác mạc và các dấu hiệu bệnh lý nếu cần thiết.'],
  ['05', 'Tư vấn giải pháp', 'Phân tích kết quả và tư vấn loại tròng kính, hướng chăm sóc hoặc lịch tái khám.'],
];

const pricingPlans = [
  {
    title: 'Khám cơ bản',
    price: '200.000đ',
    features: ['Khai thác tiền sử bệnh lý', 'Đo khúc xạ máy tự động', 'Thử thị lực thực tế'],
    featured: false,
  },
  {
    title: 'Khám chuyên sâu',
    price: '500.000đ',
    features: ['Bao gồm toàn bộ gói cơ bản', 'Khám bệnh lý mắt chuyên sâu', 'Tư vấn kiểm soát cận và tròng chuyên biệt'],
    featured: true,
  },
];

export default function ServicesPage() {
  return (
    <PublicShell active="services">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <span className="inline-block rounded-full bg-[#d6e3ff] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.28em] text-[#001b3d]">
              Medical Excellence
            </span>
            <h1 className="mt-6 font-['Manrope'] text-5xl font-extrabold leading-[1.04] tracking-[-0.04em] text-slate-900 sm:text-6xl">
              Dịch vụ đo khám <span className="text-[#00478d] italic">mắt chuyên sâu</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Kết hợp công nghệ nhãn khoa hiện đại với quy trình chuẩn hóa để đảm bảo từng buổi khám đều chính xác,
              dễ hiểu và phù hợp với nhu cầu thực tế của bệnh nhân.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/booking"
                className="rounded-full bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] px-7 py-3.5 text-center font-['Manrope'] text-base font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:opacity-95"
              >
                Đặt lịch khám ngay
              </Link>
              <Link
                to="/eyewear"
                className="rounded-full bg-[#ffdea5] px-7 py-3.5 text-center font-['Manrope'] text-base font-extrabold text-[#261900] transition hover:brightness-95"
              >
                Xem gọng kính
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[32px] shadow-2xl shadow-slate-900/10">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmvcoP0VfocB5J0yLRoYtD7N4ryieBCwPyjdorvKDjiVBBKAqCa95VNa1BHfaxZGsw_xr2Fu_KOuyThr_EYDVC4s4O6TuBEyKnoDF03C4xeAwSJNjQkh_om_Jdiyg_crbrAlrpDJd9O2ptQ2Awq0Th-rD7BoDk0aIKROR90ecQ06czyhLrv5DUfyrco9l_S3hU_VA03tud6-oFE09irLqO_dUpv6Qv52rzRDqIytuXswozJY7fuR9KKz9VO1gV_MSaFodKk0YU8s9a"
              alt="Thiết bị khám mắt hiện đại"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#f2f4f6] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="font-['Manrope'] text-4xl font-extrabold tracking-[-0.03em] text-slate-900">
              Quy trình đo khám 5 bước chuẩn y khoa
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Chính xác, tận tâm và chuyên nghiệp là tiêu chuẩn áp dụng ở mọi buổi khám tại AnVy Clinic.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {processSteps.map(([index, title, description]) => (
              <article
                key={index}
                className="rounded-[24px] border-b-4 border-[#00478d] bg-white p-7 shadow-sm transition hover:-translate-y-1"
              >
                <p className="font-['Manrope'] text-4xl font-black text-[#00478d]/12">{index}</p>
                <h3 className="mt-4 font-['Manrope'] text-lg font-extrabold text-[#00478d]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-['Manrope'] text-4xl font-extrabold tracking-[-0.03em] text-slate-900">
                Công nghệ chẩn đoán tiên tiến
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Hệ thống thiết bị hiện đại được đầu tư để giúp việc đo khúc xạ và khám mắt diễn ra nhanh, chính xác và
                giảm tối đa sai số chủ quan.
              </p>
            </div>
            <Link to="/booking" className="text-sm font-bold text-[#00478d] transition hover:text-[#005eb8]">
              Đặt lịch trải nghiệm
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
            <div className="overflow-hidden rounded-[28px] md:col-span-2 md:row-span-2">
              <img src={equipmentImages[0]} alt="Auto Refractor" className="h-full w-full object-cover" />
            </div>
            <div className="overflow-hidden rounded-[28px] md:col-span-2">
              <img src={equipmentImages[1]} alt="Digital Phoropter" className="h-full w-full object-cover" />
            </div>
            <div className="overflow-hidden rounded-[28px]">
              <img src={equipmentImages[2]} alt="Diagnostic lens" className="h-full w-full object-cover" />
            </div>
            <div className="overflow-hidden rounded-[28px]">
              <img src={equipmentImages[3]} alt="Optical boutique" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f9fb] py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="font-['Manrope'] text-4xl font-extrabold tracking-[-0.03em] text-slate-900">Bảng giá gói khám</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">Minh bạch và linh hoạt theo mức độ tư vấn bạn cần.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {pricingPlans.map((plan) => (
              <article
                key={plan.title}
                className={`rounded-[32px] p-10 text-center shadow-sm ${
                  plan.featured ? 'bg-[#00478d] text-white' : 'border border-slate-200 bg-white text-slate-900'
                }`}
              >
                <p className={`font-['Manrope'] text-2xl font-extrabold ${plan.featured ? 'text-white' : 'text-slate-900'}`}>
                  {plan.title}
                </p>
                <p className={`mt-4 text-3xl font-black ${plan.featured ? 'text-[#ffdea5]' : 'text-[#00478d]'}`}>
                  {plan.price}
                </p>
                <div className="mt-8 space-y-4 text-left">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <span className={plan.featured ? 'text-[#ffdea5]' : 'text-[#00478d]'}>✓</span>
                      <span className={plan.featured ? 'text-blue-50/90' : 'text-slate-600'}>{feature}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/booking"
                  className={`mt-10 inline-flex w-full justify-center rounded-full px-6 py-3.5 font-['Manrope'] text-base font-extrabold transition ${
                    plan.featured
                      ? 'bg-white text-[#00478d] hover:bg-slate-100'
                      : 'border-2 border-[#00478d] text-[#00478d] hover:bg-[#00478d] hover:text-white'
                  }`}
                >
                  Chọn gói này
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
