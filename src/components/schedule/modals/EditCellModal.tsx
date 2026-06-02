import { useState } from 'react';
import { X, Save, RotateCcw, Lock, LockOpen } from 'lucide-react';
import type { Cell } from '../../../types';
import { DAYS, TIMES } from '../../../constants/schedule';

interface Props {
  cell:        Cell;
  dayIdx:      number;
  timeIdx:     number;
  onSave:      (dayIdx: number, timeIdx: number, title: string, link?: string) => void;
  onSetFixed:  (dayIdx: number, timeIdx: number, title: string, link?: string) => void;
  onUnfix:     (dayIdx: number, timeIdx: number) => void;
  onReset:     (dayIdx: number, timeIdx: number) => void;
  onClose:     () => void;
}

export function EditCellModal({
  cell, dayIdx, timeIdx, onSave, onSetFixed, onUnfix, onReset, onClose,
}: Props) {
  const [title, setTitle] = useState(cell.title);
  const [link,  setLink]  = useState(cell.link ?? '');
  const [error, setError] = useState('');
  const isFixed  = cell.type === 'fixed';
  const isMember = cell.type === 'member';

  const handleSave = () => {
    if (!title.trim()) { setError('프로그램명을 입력해주세요'); return; }
    onSave(dayIdx, timeIdx, title.trim(), link.trim() || undefined);
    onClose();
  };

  const handleSetFixed = () => {
    if (!title.trim()) { setError('프로그램명을 입력해주세요'); return; }
    onSetFixed(dayIdx, timeIdx, title.trim(), link.trim() || undefined);
    onClose();
  };

  const handleUnfix = () => {
    onUnfix(dayIdx, timeIdx);
    onClose();
  };

  const handleReset = () => {
    onReset(dayIdx, timeIdx);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal edit-cell-modal">
        <div className="modal-hd">
          <div className="modal-title-row">
            <div className="modal-ico">✏️</div>
            <div>
              <h3>편성표 편집</h3>
              <p>
                {DAYS[dayIdx]}요일 {isMember ? '회원 전용' : `${TIMES[timeIdx]} 슬롯`}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-form">
          <div className="ff">
            <label className="fl">프로그램명 <span className="req">*</span></label>
            <input
              className={`inp ${error ? 'inp-err' : ''}`}
              placeholder="방송 프로그램명"
              value={title}
              maxLength={20}
              onChange={e => { setTitle(e.target.value); setError(''); }}
              autoFocus
            />
            {error && <span className="fe">{error}</span>}
          </div>

          <div className="ff">
            <label className="fl">링크 (선택)</label>
            <input
              className="inp"
              placeholder="https://... (시청 링크)"
              value={link}
              onChange={e => setLink(e.target.value)}
            />
          </div>

          <p className="edit-cell-notice edit-cell-notice-info">
            💡 <strong>저장</strong>은 제목·링크만 바꿉니다. 고정 편성 지정/해제는 아래 버튼을 사용하세요.
          </p>

          <div className="form-actions">
            <button type="button" className="btn-ghost-sm" onClick={handleReset} title="기본값으로 초기화">
              <RotateCcw size={14} /> 초기화
            </button>
            <button type="button" className="btn-ghost-sm" onClick={onClose}>취소</button>
            <button type="button" className="btn-coral-form" onClick={handleSave}>
              <Save size={14} /> 저장
            </button>
          </div>

          {!isMember && (
            <div className="edit-cell-fixed-actions">
              {isFixed ? (
                <button type="button" className="btn-unfix" onClick={handleUnfix}>
                  <LockOpen size={14} /> 고정 편성 해제
                </button>
              ) : (
                <button type="button" className="btn-set-fixed" onClick={handleSetFixed}>
                  <Lock size={14} /> 고정 편성으로 지정
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
