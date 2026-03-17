import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DefaultInfoForm from '../components/DefaultInfoForm';
import api from '../services/api';
import type { DefaultInfo } from '../types';

type Tab = 'account' | 'password';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('account');
  const [defaultAccount, setDefaultAccount] = useState<DefaultInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    fetchDefaultAccount();
  }, []);

  const fetchDefaultAccount = async () => {
    try {
      const res = await api.get('/admin/default-account');
      setDefaultAccount(res.data);
    } catch {
      // no account yet
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccount = async (info: DefaultInfo) => {
    try {
      const res = await api.put('/admin/default-account', {
        bank_bin: info.bankBin,
        bank_name: info.bankName,
        bank_logo: info.bankLogo,
        account_no: info.accountNo,
        description: info.description,
      });
      setDefaultAccount({
        bankBin: res.data.bank_bin,
        bankName: res.data.bank_name,
        bankLogo: res.data.bank_logo,
        accountNo: res.data.account_no,
        description: res.data.description,
      });
      setMessage({ type: 'success', text: 'Đã lưu thông tin tài khoản!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Lỗi khi lưu' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    setMessage(null);
    try {
      await api.patch('/admin/change-password', {
        current_password: currentPw,
        new_password: newPw,
      });
      setCurrentPw('');
      setNewPw('');
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Lỗi khi đổi mật khẩu' });
    } finally {
      setPwLoading(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'account', label: 'Tài khoản mặc định', icon: '🏦' },
    { key: 'password', label: 'Đổi mật khẩu', icon: '🔒' },
  ];

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="font-bold text-text">Admin</span>
            <span className="text-xs text-text-muted bg-surface-lighter px-2 py-0.5 rounded-full">{user?.username}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-text-muted hover:text-primary transition-colors"
            >
              Trang chủ
            </button>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setMessage(null); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === t.key
                    ? 'bg-primary text-white'
                    : 'bg-surface-light text-text-muted hover:bg-surface-lighter'
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Tab Content */}
          {tab === 'account' && (
            loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <DefaultInfoForm
                initialData={defaultAccount}
                onSave={handleSaveAccount}
              />
            )
          )}

          {tab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Mật khẩu mới"
                  className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={pwLoading || !currentPw || !newPw}
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {pwLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
