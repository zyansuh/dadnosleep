
import type { Cell } from '../../types';
import { cellTitleFontSize } from '../../utils/schedule/cellDisplay';

export type MemberLockState = 'open' | 'login' | 'members-only';

interface Props {
  cell:            Cell;
  isLive:          boolean;
  memberLockState: MemberLockState;
  onLoginClick?:   () => void;
}

export function CellInner({ cell, isLive, memberLockState, onLoginClick }: Props) {
  if (cell.type === 'empty') {
    return <span className="cell-empty">비어 있음</span>;
  }

  if (cell.type === 'member' && memberLockState !== 'open') {
    return (
      <div className="cell-member-locked">
        <span className="cell-member-lock-icon">🔒</span>
        <span className="cell-member-lock-label">VIP 전용</span>
        {memberLockState === 'login' ? (
          <>
            <span className="cell-member-lock-hint">로그인 후 시청</span>
            {onLoginClick && (
              <button
                type="button"
                className="cell-login-btn"
                onClick={e => { e.stopPropagation(); onLoginClick(); }}
              >
                로그인
              </button>
            )}
          </>
        ) : (
          <p className="cell-member-lock-msg">
            VIP로 지정된 동호회 회원만 볼 수 있는 편성입니다.
            VIP 지정은 관리자에게 문의해 주세요.
          </p>
        )}
      </div>
    );
  }

  const fontSize = cellTitleFontSize(cell.title);

  if (cell.type === 'fixed') {
    return (
      <>
        <span className="cell-fixed-label">⭐ 고정 편성</span>
        <span className="cell-title" style={{ fontSize }}>{cell.title}</span>
        {isLive && <span className="live-dot-anim" />}
      </>
    );
  }

  if (cell.type === 'member') {
    return (
      <>
        <span className="cell-member-label">👑 회원 전용</span>
        <span className="cell-title" style={{ fontSize }}>{cell.title}</span>
        {isLive && <span className="live-dot-anim" />}
      </>
    );
  }

  return (
    <>
      <span className="cell-title" style={{ fontSize }}>{cell.title}</span>
      <span className={`tag tag-${cell.bt}`}>{cell.badge}</span>
      {isLive && <span className="live-dot-anim" />}
    </>
  );
}
