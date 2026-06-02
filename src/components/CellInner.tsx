
import type { Cell } from '../types';

export type MemberLockState = 'open' | 'login' | 'members-only';

interface Props {
  cell:            Cell;
  isLive:          boolean;
  memberLockState: MemberLockState;
  onLoginClick?:   () => void;
}

function calcFontSize(text: string): string {
  const weight = [...text].reduce((acc, ch) => {
    const code = ch.charCodeAt(0);
    const isWide = (code >= 0xAC00 && code <= 0xD7A3) ||
                   (code >= 0x4E00 && code <= 0x9FFF) ||
                   (code >= 0x3040 && code <= 0x30FF);
    return acc + (isWide ? 2 : 1);
  }, 0);

  if (weight <= 8)  return '12px';
  if (weight <= 12) return '11px';
  if (weight <= 16) return '10px';
  if (weight <= 20) return '9px';
  return '8px';
}

export function CellInner({ cell, isLive, memberLockState, onLoginClick }: Props) {
  if (cell.type === 'empty') {
    return <span className="cell-empty">비어 있음</span>;
  }

  if (cell.type === 'member' && memberLockState !== 'open') {
    return (
      <div className="cell-member-locked">
        <span className="cell-member-lock-icon">🔒</span>
        <span className="cell-member-lock-label">회원 전용</span>
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
            현재 동호회 회원만 이용 가능한 콘텐츠입니다.
            가입 문의는 관리자에게 연락해주세요.
          </p>
        )}
      </div>
    );
  }

  const fontSize = calcFontSize(cell.title);

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
