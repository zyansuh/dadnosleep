import { X, Shield } from 'lucide-react';
import { DiscordLoginButton } from '../DiscordLoginButton';

interface Props {
  onClose: () => void;
}

export function AdminLoginRequiredModal({ onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal admin-pw-modal">
        <div className="modal-hd">
          <div className="modal-title-row">
            <div className="modal-ico"><Shield size={18} /></div>
            <div>
              <h3>관리자 로그인 필요</h3>
              <p>관리자 페이지는 Discord 관리자 계정으로만 접근할 수 있습니다.</p>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-form">
          <p className="admin-login-hint">
            관리자로 등록된 Discord 계정으로 로그인한 뒤 다시 시도해 주세요.
            관리자 추가는 <code>src/constants/adminUsers.ts</code> 또는
            환경변수 <code>VITE_ADMIN_DISCORD_USERS</code>를 참고하세요.
          </p>
          <div className="form-actions">
            <button type="button" className="btn-ghost-sm" onClick={onClose}>닫기</button>
            <DiscordLoginButton />
          </div>
        </div>
      </div>
    </div>
  );
}
