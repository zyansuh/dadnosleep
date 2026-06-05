import { useEffect, useState } from 'react';
import { X, Eye, EyeOff, Lock } from 'lucide-react';
import {
  getLockRemainingMs,
  recordFailedAttempt,
  setAdminSession,
  verifyAdminPassword,
} from '../../utils/auth/adminSession';
import { fetchPasswordAdminToken, setAdminApiToken } from '../../utils/admin/adminApiToken';

interface Props {
  onSuccess: () => void;
  onClose:   () => void;
}

export function AdminPasswordModal({ onSuccess, onClose }: Props) {
  const [password, setPassword] = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [error,     setError]     = useState('');
  const [lockMs,    setLockMs]    = useState(getLockRemainingMs());

  useEffect(() => {
    if (lockMs <= 0) return;
    const id = window.setInterval(() => {
      const left = getLockRemainingMs();
      setLockMs(left);
    }, 500);
    return () => window.clearInterval(id);
  }, [lockMs]);

  const locked = lockMs > 0;
  const lockSec = Math.ceil(lockMs / 1000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;

    if (!import.meta.env.VITE_ADMIN_PASSWORD) {
      setError('관리자 비밀번호가 설정되지 않았습니다. 운영 담당자에게 문의해 주세요.');
      return;
    }

    if (verifyAdminPassword(password)) {
      void (async () => {
        try {
          const token = await fetchPasswordAdminToken(password);
          setAdminApiToken(token);
          setAdminSession();
          onSuccess();
        } catch (err) {
          setError(err instanceof Error ? err.message : '인증에 실패했습니다.');
        }
      })();
      return;
    }

    const result = recordFailedAttempt();
    setPassword('');
    if (result.locked) {
      setLockMs(result.remainingMs);
      setError(`5회 오류로 ${Math.ceil(result.remainingMs / 1000)}초간 잠금됩니다.`);
    } else {
      setError(`비밀번호가 올바르지 않습니다. (${result.attemptsLeft}회 남음)`);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal admin-pw-modal">
        <div className="modal-hd">
          <div className="modal-title-row">
            <div className="modal-ico"><Lock size={18} /></div>
            <div>
              <h3>관리자 인증</h3>
              <p>관리자 페이지 접근을 위해 비밀번호를 입력하세요</p>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="ff">
            <label className="fl">관리자 비밀번호</label>
            <div className="pw-input-wrap">
              <input
                className={`inp ${error ? 'inp-err' : ''}`}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="비밀번호"
                disabled={locked}
                autoFocus
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <span className="fe">{error}</span>}
            {locked && (
              <span className="fe">잠금 해제까지 {lockSec}초</span>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-ghost-sm" onClick={onClose}>취소</button>
            <button type="submit" className="btn-coral-form" disabled={locked || !password}>
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
