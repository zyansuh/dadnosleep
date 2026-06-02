import { useState } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthModal() {
  const {
    authModalOpen, closeAuthModal, authModalTab, setAuthModalTab, login, register,
  } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [pending,  setPending]  = useState(false);

  if (!authModalOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      if (authModalTab === 'login') await login(email, password);
      else await register(email, password);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeAuthModal()}>
      <div className="modal auth-modal">
        <div className="modal-hd">
          <div className="modal-title-row">
            <div className="modal-ico">{authModalTab === 'login' ? '🔐' : '✨'}</div>
            <div>
              <h3>{authModalTab === 'login' ? '로그인' : '회원가입'}</h3>
              <p>회원 전용 편성 · 관리자 기능 이용</p>
            </div>
          </div>
          <button className="modal-close" onClick={closeAuthModal}><X size={18} /></button>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${authModalTab === 'login' ? 'active' : ''}`}
            onClick={() => { setAuthModalTab('login'); setError(''); }}
          >
            <LogIn size={14} /> 로그인
          </button>
          <button
            type="button"
            className={`auth-tab ${authModalTab === 'register' ? 'active' : ''}`}
            onClick={() => { setAuthModalTab('register'); setError(''); }}
          >
            <UserPlus size={14} /> 회원가입
          </button>
        </div>

        <form className="modal-form" onSubmit={submit}>
          <div className="ff">
            <label className="fl">이메일</label>
            <input
              className="inp"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="ff">
            <label className="fl">비밀번호</label>
            <input
              className="inp"
              type="password"
              autoComplete={authModalTab === 'login' ? 'current-password' : 'new-password'}
              placeholder="6자 이상"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          {error && <p className="fe" style={{ textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="btn-coral-form" style={{ width: '100%' }} disabled={pending}>
            {pending ? '처리 중…' : authModalTab === 'login' ? '로그인' : '가입하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
