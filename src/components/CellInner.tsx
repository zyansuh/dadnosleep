
import type { Cell } from '../types';

interface Props {
  cell:   Cell;
  isLive: boolean;
}

/**
 * 한글 포함 텍스트 길이를 고려해 자동으로 font-size 계산
 * 한글/CJK 문자는 2배 너비로 계산
 */
function calcFontSize(text: string): string {
  const weight = [...text].reduce((acc, ch) => {
    const code = ch.charCodeAt(0);
    // 한글 / CJK 범위
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

export function CellInner({ cell, isLive }: Props) {
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

  return (
    <>
      <span className="cell-title" style={{ fontSize }}>{cell.title}</span>
      <span className={`tag tag-${cell.bt}`}>{cell.badge}</span>
      {isLive && <span className="live-dot-anim" />}
    </>
  );
}
