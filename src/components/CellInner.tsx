import React from 'react';
import type { Cell } from '../types';

interface Props {
  cell:   Cell;
  isLive: boolean;
}

export function CellInner({ cell, isLive }: Props) {
  if (cell.type === 'fixed') {
    return (
      <>
        <span className="cell-fixed-label">⭐ 고정 편성</span>
        <span className="cell-title">{cell.title}</span>
        {isLive && <span className="live-dot-anim" />}
      </>
    );
  }

  return (
    <>
      <span className="cell-title">{cell.title}</span>
      <span className={`tag tag-${cell.bt}`}>{cell.badge}</span>
      {isLive && <span className="live-dot-anim" />}
    </>
  );
}
