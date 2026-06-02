import { useState } from 'react';
import { X } from 'lucide-react';
import { validateNickname } from '../../utils/nickname';

interface Props {
  currentNickname: string;
  onSave:          (nickname: string) => Promise<void>;
  onClose:         () => void;
}

export function NicknameChangeModal({ currentNickname, onSave, onClose }: Props) {
  const [value, setValue]   = useState(currentNickname);
  const [error, setError]   = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateNickname(value);
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(value.trim());
      onClose();
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal nickname-modal">
        <div className="modal-hd">
          <h3>닉네임 변경</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={e => void handleSubmit(e)}>
          <p className="nickname-modal-current">
            현재 닉네임: <strong>{currentNickname}</strong>
          </p>
          <label className="fl" htmlFor="new-nickname">새 닉네임</label>
          <input
            id="new-nickname"
            className="inp"
            value={value}
            onChange={e => { setValue(e.target.value); setError(null); }}
            maxLength={20}
            autoFocus
            disabled={saving}
          />
          <p className="nickname-modal-hint">2~20자 · 한글·영문·숫자·_ 만 가능</p>
          {error && <p className="nickname-modal-error">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn-ghost-sm" onClick={onClose} disabled={saving}>
              취소
            </button>
            <button type="submit" className="btn-coral-form" style={{ flex: 1 }} disabled={saving}>
              {saving ? '저장 중…' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
