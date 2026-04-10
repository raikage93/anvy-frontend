import { useEffect, useState } from 'react';
import api from '../services/api';
import type { EyewearProduct } from '../types';

type ProductFormState = {
  id: number | null;
  name: string;
  brand: string;
  frame_type: string;
  price: string;
  description: string;
  image_url: string;
  quantity: string;
  sort_order: string;
  is_active: boolean;
};

const initialForm: ProductFormState = {
  id: null,
  name: '',
  brand: '',
  frame_type: '',
  price: '0',
  description: '',
  image_url: '',
  quantity: '0',
  sort_order: '0',
  is_active: true,
};

export default function EyewearProductManager() {
  const [form, setForm] = useState<ProductFormState>(initialForm);
  const [products, setProducts] = useState<EyewearProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    void fetchProducts();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get<EyewearProduct[]>('/admin/eyewear-products');
      setProducts(response.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = new FormData();
      payload.append('name', form.name.trim());
      payload.append('brand', form.brand.trim());
      payload.append('frame_type', form.frame_type.trim());
      payload.append('price', String(Number(form.price)));
      payload.append('description', form.description.trim());
      payload.append('quantity', String(Number(form.quantity)));
      payload.append('sort_order', String(Number(form.sort_order)));
      payload.append('is_active', String(form.is_active));
      payload.append('image_url', form.image_url.trim());
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (form.id) {
        await api.put(`/admin/eyewear-products/${form.id}`, payload);
        setMessage({ type: 'success', text: 'Đã cập nhật sản phẩm.' });
      } else {
        await api.post('/admin/eyewear-products', payload);
        setMessage({ type: 'success', text: 'Đã thêm sản phẩm mới.' });
      }

      resetForm();
      await fetchProducts();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Không thể lưu sản phẩm.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: EyewearProduct) => {
    setForm({
      id: product.id,
      name: product.name,
      brand: product.brand,
      frame_type: product.frame_type,
      price: String(product.price),
      description: product.description || '',
      image_url: product.image_url,
      quantity: String(product.quantity),
      sort_order: String(product.sort_order),
      is_active: product.is_active,
    });
    setImageFile(null);
    setImagePreview(product.image_url);
    setMessage(null);
  };

  const handleSelectImage = (file: File | null) => {
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    if (!file) {
      setImagePreview(form.image_url);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm('Bạn có chắc muốn xoá sản phẩm này?')) {
      return;
    }

    try {
      await api.delete(`/admin/eyewear-products/${productId}`);
      if (form.id === productId) {
        resetForm();
      }
      setMessage({ type: 'success', text: 'Đã xoá sản phẩm.' });
      await fetchProducts();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Không thể xoá sản phẩm.' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {message ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="rounded-[28px] border border-border bg-surface-light p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-light">Sản phẩm gọng kính</p>
          <h2 className="mt-3 text-2xl font-semibold text-text">{form.id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <p className="mt-2 text-sm leading-7 text-text-muted">
            Các sản phẩm ở đây sẽ hiển thị trực tiếp tại trang Gọng kính ngoài website.
          </p>

          <div className="mt-6 grid gap-4">
            <label className="block text-sm text-text-muted">
              <span className="mb-1.5 block">Tên sản phẩm</span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="Ví dụ: Gọng Titanium trẻ em"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-text-muted">
                <span className="mb-1.5 block">Brand</span>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="Ví dụ: Ray-Ban"
                />
              </label>
              <label className="block text-sm text-text-muted">
                <span className="mb-1.5 block">Loại gọng</span>
                <input
                  type="text"
                  value={form.frame_type}
                  onChange={(event) => setForm((current) => ({ ...current, frame_type: event.target.value }))}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="Ví dụ: Titanium / Acetate"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-text-muted">
                <span className="mb-1.5 block">Giá (VND)</span>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </label>
              <label className="block text-sm text-text-muted">
                <span className="mb-1.5 block">Ảnh sản phẩm</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleSelectImage(event.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
                {form.id ? (
                  <p className="mt-2 text-xs text-text-muted">
                    Khi không chọn file mới, hệ thống sẽ giữ nguyên ảnh hiện tại.
                  </p>
                ) : null}
              </label>
            </div>

            <label className="block text-sm text-text-muted">
              <span className="mb-1.5 block">Mô tả</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="Mô tả ngắn về chất liệu, kiểu dáng, đối tượng phù hợp..."
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-text-muted">
                <span className="mb-1.5 block">Số lượng</span>
                <input
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </label>
              <label className="block text-sm text-text-muted">
                <span className="mb-1.5 block">Thứ tự hiển thị</span>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </label>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
                className="h-4 w-4 rounded border-border bg-surface-light text-primary focus:ring-primary"
              />
              Hiển thị sản phẩm ngoài trang user
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : form.id ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-medium text-text transition hover:bg-surface-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              Tạo form mới
            </button>
          </div>
        </form>

        <div className="rounded-[28px] border border-border bg-surface-light p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-light">Preview ảnh</p>
          <h2 className="mt-3 text-2xl font-semibold text-text">Xem trước hình sản phẩm</h2>
          <div className="mt-6">
            {imagePreview || form.image_url ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-surface p-4">
                <img
                  src={imagePreview || form.image_url}
                  alt="preview"
                  className="aspect-square w-full rounded-xl object-contain bg-white"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-10 text-center text-sm text-text-muted">
                Chọn file ảnh để xem preview.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-border bg-surface-light p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-light">Danh sách sản phẩm</p>
            <h3 className="mt-3 text-xl font-semibold text-text">Sản phẩm đang quản lý</h3>
          </div>
          <button
            type="button"
            onClick={() => void fetchProducts()}
            className="rounded-2xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition hover:bg-surface-light"
          >
            Tải lại dữ liệu
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-text-muted">
              Chưa có sản phẩm nào.
            </div>
          ) : (
            products.map((product) => (
              <article key={product.id} className="rounded-2xl border border-border/80 bg-surface px-4 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-xl bg-white object-contain p-2" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-text">{product.name}</p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                            product.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/15 text-slate-400'
                          }`}
                        >
                          {product.is_active ? 'Đang bật' : 'Đang tắt'}
                        </span>
                      </div>
                    <p className="mt-1 text-sm leading-6 text-text-muted">{product.description || 'Không có mô tả.'}</p>
                    <p className="mt-1 text-xs font-medium text-text-muted">
                      {product.brand} · {product.frame_type}
                    </p>
                  </div>
                  </div>

                  <div className="grid gap-2 sm:min-w-[210px]">
                    <p className="text-sm text-text-muted">
                      Số lượng: <span className="font-semibold text-text">{product.quantity}</span>
                    </p>
                    <p className="text-sm text-text-muted">
                      Giá: <span className="font-semibold text-text">{new Intl.NumberFormat('vi-VN').format(product.price)}đ</span>
                    </p>
                    <p className="text-sm text-text-muted">
                      Thứ tự: <span className="font-semibold text-text">{product.sort_order}</span>
                    </p>
                    <div className="mt-1 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(product.id)}
                        className="rounded-xl border border-red-400/40 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/10"
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
