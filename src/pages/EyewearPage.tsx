import { Link } from 'react-router-dom';
import PublicShell from '../components/PublicShell';

const products = [
  {
    label: 'Lumina Signature',
    name: 'Aura Titanium Black',
    price: '3.450.000đ',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNGpBpaQdW5XGNht5WNRb4Rfa76y-1Ysh_dgbFWbrwkqZCkrDadd3ui2xOzv0JYjAk_edhKbjCy1xHN0lcOgpmML4zjM-qbZbf3-ZzhTUJSlQg8CeD-iWxZKH9Hxlzd2q1SM6XSUgaU2wI56OAVE9N7xExYuhChQVMMUnrLxpB4vB2Ja2Lm5ODEDfVx764KVK5_A6oIAyav-HByNFrECGFDfn46nb2Krz_JxVPQyAEvoqkq0Sc57xmOuASFaDkyA9NAFWMfVUQwOov',
  },
  {
    label: 'Iconic Collection',
    name: 'Stellar Gold Aviator',
    price: '2.890.000đ',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDX0SR0XYZtDklU6xeunvlqnlAIvEGR2N5QabHzUfDLMrMfmQUZCh4DSuCBlQbqqDhC7IBcYO8Z8WirADwHz3KSUYuz3ZxzMgVNtdVk2YVYoEfHjO2T7h1zFslYAq1lPPVRsojdQH616zkdZWIGp8ueXUGY4A9oCsBWua0BRYx9IDLSTuI9leTA9xINffhrNzZpQ2BdilmT6zozYkcLJRtuygoMk67mYrzGjkwTdn2el-u9Cy__kY1rx4C_BXYE74FvK4AOuvDSVfXe',
  },
  {
    label: 'Heritage Series',
    name: 'Vintage Tortoise Round',
    price: '1.950.000đ',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBhTAmTVzVrpNS64jTeM_MTPLWdfQAPxzOdZ0LRW8VWJsN-EKPd7ltanG578GKtc5_ybhx_oU7X3GGtzdeJdx1LdZZIA1ZNWmDS8JPwGYQ34ofqomexyw2QmNKbF8sGtLXX20DB80HiKoIiIqhXLbszvjt2awE_pWEFl2RnNxkF6jNMDkE5BKTataKYBsMAgDawE1o4LtQb0kkVh6jOtPZ87-vZ5FbEkeW7ebRB1GS6hSOu2KKvycAxhckdXg3cEQBxXZ7xz7ea1Fdi',
  },
  {
    label: 'Modernist',
    name: 'Crystal Clarity Rect',
    price: '2.150.000đ',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBMeRB7dK7AIsQKzbPnC9W4MwRrNTTk_4s4MV7nFgT9K9O23t1lgoFDWk7tK6cL6VCF5cKtwnKt1rEY-_Jdv9gQhxpudmu-YAlgxzb7wA5-nAFkp6vKpyi3gpQEbgxP8xE3L_TEzftXX3rBsTC0kBQztJQPZWftZfgvGiPwMB8GG7sqIrUB06jwqQ0-CklPbhY4C_ouLUFtcnC5MjRRzuoR1eK3TV3VTQN70MfQ4VCnaxeQ_QUR9Irjg7bBqqz9qfRq4Q139kdTq0Id',
  },
];

const filterPills = ['Nhựa Acetate', 'Titanium', 'Hợp kim'];

export default function EyewearPage() {
  return (
    <PublicShell active="eyewear">
      <section className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:px-8 lg:py-24">
          <div className="w-full space-y-6 lg:w-1/2">
            <span className="text-xs font-bold uppercase tracking-[0.32em] text-[#00478d]">Bộ sưu tập cao cấp</span>
            <h1 className="font-['Manrope'] text-5xl font-extrabold leading-none tracking-[-0.04em] text-slate-900 sm:text-6xl">
              Bộ sưu tập <br />
              <span className="text-[#00478d]">Gọng kính & Tròng kính</span>
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              Khám phá sự giao thoa giữa nghệ thuật chế tác và công nghệ nhãn khoa hiện đại. Mỗi thiết kế được chọn để
              vừa đẹp khi đeo, vừa tối ưu cho trải nghiệm nhìn mỗi ngày.
            </p>
            <Link
              to="/booking"
              className="inline-flex rounded-full bg-[linear-gradient(135deg,#00478d_0%,#005eb8_100%)] px-7 py-3.5 font-['Manrope'] text-base font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:opacity-95"
            >
              Đặt lịch thử kính
            </Link>
          </div>

          <div className="relative w-full lg:w-1/2">
            <div className="overflow-hidden rounded-[32px] shadow-2xl shadow-slate-900/10">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbTiHIZC8UPnCsd6ndkxtM2kYj8TrcopvIhSUN7VwiRwnpz-il5kezcuoF9fxJ0-u2GOAh5c_j4F-ZmcmhzqOyRW4nkBjxdKP5Ar3yOVfpXCnGDpna4JVyebywdglCs-41BpVnUcZKgl7Amk7DHFHOYxLStPB8YOaJJhgXA9BRh3IYwoE3v4gxcqKn-utd_dP3NgGC4_yI1MerfccFS0TTa9W_uIkSrQ56_uG0eZ2xdPOGoaDtcjCaOHOgoxQ37ByRa5Zt6FHGe4mk"
                alt="Bộ sưu tập gọng kính"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f9fb] py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.28fr_0.72fr] lg:px-8">
          <aside>
            <div className="rounded-[28px] bg-white p-8 shadow-sm">
              <h2 className="font-['Manrope'] text-xl font-extrabold text-slate-900">Bộ lọc</h2>

              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Kiểu dáng</p>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  {['Tròn', 'Vuông', 'Phi công', 'Mắt mèo'].map((shape) => (
                    <label key={shape} className="flex items-center gap-3">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#00478d] focus:ring-[#00478d]" />
                      <span>{shape}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Chất liệu</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {filterPills.map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-[#00478d] hover:text-[#00478d]"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Giá cả</p>
                <input type="range" className="mt-4 h-1.5 w-full cursor-pointer accent-[#00478d]" />
                <div className="mt-2 flex justify-between text-xs font-medium text-slate-500">
                  <span>1.000.000đ</span>
                  <span>10.000.000đ</span>
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-8 flex items-end justify-between">
              <p className="text-sm font-medium text-slate-500">Hiển thị 24 sản phẩm</p>
              <button type="button" className="text-sm font-bold text-[#00478d]">
                Sắp xếp: Mới nhất
              </button>
            </div>

            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.name}
                  className="group overflow-hidden rounded-[28px] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="aspect-square bg-[#f9f9f9] p-8">
                    <img src={product.image} alt={product.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00478d]">{product.label}</p>
                    <h3 className="mt-2 font-['Manrope'] text-xl font-extrabold text-slate-900">{product.name}</h3>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-black text-slate-900">{product.price}</span>
                      <Link to="/booking" className="text-sm font-bold text-[#00478d] transition hover:text-[#005eb8]">
                        Đặt thử kính
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
