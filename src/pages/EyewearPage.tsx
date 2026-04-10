import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicShell from '../components/PublicShell';
import api from '../services/api';
import type { EyewearProduct, EyewearSearchResponse } from '../types';

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
}

export default function EyewearPage() {
  const [products, setProducts] = useState<EyewearProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [keyword, setKeyword] = useState('');
  const [brand, setBrand] = useState('');
  const [frameType, setFrameType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [facets, setFacets] = useState<EyewearSearchResponse['facets']>({
    brands: [],
    frame_types: [],
    price: { min: 0, max: 0 },
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setKeyword(query.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get<EyewearSearchResponse>('/eyewear-products/search', {
          params: {
            q: keyword || undefined,
            brand: brand || undefined,
            frame_type: frameType || undefined,
            min_price: minPrice || undefined,
            max_price: maxPrice || undefined,
            page: 1,
            size: 60,
          },
        });

        setProducts(response.data.items || []);
        setFacets(
          response.data.facets || {
            brands: [],
            frame_types: [],
            price: { min: 0, max: 0 },
          }
        );
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
  }, [brand, frameType, keyword, maxPrice, minPrice]);

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
              Tìm nhanh sản phẩm theo brand, loại gọng và khoảng giá ngay tại một màn hình.
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

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Tìm kiếm</p>
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tên sản phẩm, brand, mô tả..."
                  className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#00478d] focus:ring-2 focus:ring-[#00478d]/20"
                />
              </div>

              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Brand</p>
                <select
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                  className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#00478d] focus:ring-2 focus:ring-[#00478d]/20"
                >
                  <option value="">Tất cả brand</option>
                  {facets.brands.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Loại gọng</p>
                <select
                  value={frameType}
                  onChange={(event) => setFrameType(event.target.value)}
                  className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#00478d] focus:ring-2 focus:ring-[#00478d]/20"
                >
                  <option value="">Tất cả loại gọng</option>
                  {facets.frame_types.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Giá (VND)</p>
                <div className="mt-3 grid gap-3">
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    placeholder={`Từ ${formatCurrency(facets.price.min)}`}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#00478d] focus:ring-2 focus:ring-[#00478d]/20"
                  />
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    placeholder={`Đến ${formatCurrency(facets.price.max)}`}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#00478d] focus:ring-2 focus:ring-[#00478d]/20"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setKeyword('');
                  setBrand('');
                  setFrameType('');
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="mt-8 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#00478d] hover:text-[#00478d]"
              >
                Xoá bộ lọc
              </button>
            </div>
          </aside>

          <div>
            <div className="mb-8 flex items-end justify-between">
              <p className="text-sm font-medium text-slate-500">Hiển thị {products.length} sản phẩm</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#005eb8]/20 border-t-[#005eb8]" />
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center text-slate-600">
                Không có sản phẩm phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-[28px] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="aspect-square bg-[#f9f9f9] p-8">
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00478d]">{product.brand}</p>
                      <h3 className="mt-2 font-['Manrope'] text-xl font-extrabold text-slate-900">{product.name}</h3>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{product.frame_type}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{product.description || 'Không có mô tả.'}</p>
                      <div className="mt-4 space-y-1">
                        <p className="text-base font-black text-slate-900">{formatCurrency(product.price)}</p>
                        <p className="text-sm font-medium text-slate-700">Số lượng còn: {product.quantity}</p>
                      </div>
                      <div className="mt-4">
                        <Link to="/booking" className="text-sm font-bold text-[#00478d] transition hover:text-[#005eb8]">
                          Đặt thử kính
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
