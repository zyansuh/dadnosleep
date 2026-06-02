import { X, Save, Lock, LockOpen } from 'lucide-react';
import type { Cell } from '../../types';
import { useScheduleEditForm } from '../../hooks/schedule/useScheduleEditForm';

interface Props {
  sched:           Cell[][];
  memberRow:       Cell[];
  onSaveAll:       (edits: { dayIdx: number; timeIdx: number; title: string; link?: string }[]) => void;
  onSaveMemberAll: (edits: { dayIdx: number; title: string; link?: string }[]) => void;
  onSetFixed:      (dayIdx: number, timeIdx: number, title: string, link?: string) => void;
  onUnfix:         (dayIdx: number, timeIdx: number) => void;
  onClose:         () => void;
}

export function ScheduleEditModal({
  sched, memberRow, onSaveAll, onSaveMemberAll, onSetFixed, onUnfix, onClose,
}: Props) {
  const {
    activeDay, setActiveDay, defaultDay, rows, memberRows,
    updateRow, updateMemberRow, unfixRow, lockRow, collectEdits, DAYS, TIMES,
  } = useScheduleEditForm(sched, memberRow);

  const handleUnfixRow = (dayIdx: number, timeIdx: number) => {
    onUnfix(dayIdx, timeIdx);
    unfixRow(dayIdx, timeIdx);
  };

  const handleSetFixedRow = (dayIdx: number, timeIdx: number) => {
    const row = rows[dayIdx][timeIdx];
    const title = row.title.trim() || sched[dayIdx][timeIdx].title;
    onSetFixed(dayIdx, timeIdx, title, row.link.trim() || undefined);
    lockRow(dayIdx, timeIdx, title);
  };

  const handleSave = () => {
    const { edits, memberEdits } = collectEdits();
    onSaveAll(edits);
    if (memberEdits.length) onSaveMemberAll(memberEdits);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal sched-edit-big-modal">
        <div className="modal-hd">
          <div className="modal-title-row">
            <div className="modal-ico">📅</div>
            <div>
              <h3>이번 주 편성표 수정하기</h3>
              <p>요일 탭을 선택하고 프로그램을 입력하세요</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="sem-day-tabs">
          {DAYS.map((d, i) => (
            <button
              key={d}
              className={`sem-day-tab ${activeDay === i ? 'active' : ''}`}
              onClick={() => setActiveDay(i)}
            >
              {d}
              {i === defaultDay && <span className="sem-today-dot" />}
            </button>
          ))}
        </div>

        <div className="sem-slots">
          {TIMES.map((time, ti) => {
            const row = rows[activeDay][ti];
            return (
              <div key={time} className={`sem-slot ${row.locked ? 'sem-locked' : ''}`}>
                <div className="sem-time">{time}</div>
                <div className="sem-fields">
                  {row.locked ? (
                    <div className="sem-locked-info">
                      <Lock size={13} />
                      <span className="sem-locked-title">{row.title}</span>
                      <span className="sem-locked-badge">★ 고정 편성</span>
                      <button
                        type="button"
                        className="sem-unfix-btn"
                        onClick={() => handleUnfixRow(activeDay, ti)}
                      >
                        <LockOpen size={12} /> 고정 해제
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        className="inp sem-inp-title"
                        placeholder="프로그램명"
                        value={row.title}
                        maxLength={20}
                        onChange={e => updateRow(activeDay, ti, 'title', e.target.value)}
                      />
                      <input
                        className="inp sem-inp-link"
                        placeholder="링크 (선택) https://..."
                        value={row.link}
                        onChange={e => updateRow(activeDay, ti, 'link', e.target.value)}
                      />
                      <button
                        type="button"
                        className="sem-set-fixed-btn"
                        onClick={() => handleSetFixedRow(activeDay, ti)}
                      >
                        <Lock size={12} /> 고정 편성으로 지정
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          <div className="sem-slot sem-slot-member">
            <div className="sem-time">👑 VIP</div>
            <div className="sem-fields">
              <span className="sem-member-badge">회원 전용 편성</span>
              <input
                className="inp sem-inp-title"
                placeholder="프로그램명"
                value={memberRows[activeDay]?.title ?? ''}
                maxLength={20}
                onChange={e => updateMemberRow(activeDay, 'title', e.target.value)}
              />
              <input
                className="inp sem-inp-link"
                placeholder="링크 (선택) https://..."
                value={memberRows[activeDay]?.link ?? ''}
                onChange={e => updateMemberRow(activeDay, 'link', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="sem-footer">
          <p className="sem-notice">
            💡 저장은 제목·링크만 반영됩니다. 고정 편성은 별도 버튼으로 지정·해제하세요. 회원 전용(VIP) 슬롯도 요일별로 저장됩니다.
          </p>
          <div className="form-actions">
            <button type="button" className="btn-ghost-sm" onClick={onClose}>취소</button>
            <button type="button" className="btn-coral-form" onClick={handleSave}>
              <Save size={14} /> 저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
