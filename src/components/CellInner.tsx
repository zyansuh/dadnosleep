import React from 'react';
import type { Cell } from '../types';

interface Props {
  cell:   Cell;
  isLive: boolean;
}

export function CellInner({ cell, isLive }: Props) {
  return (
    <>
      <span className={`cb badge-${cell.bt}`}>{cell.badge}</span>
      <span className="ct">
        {cell.title}
        {isLive && <span className="live-dot-anim" />}
      </span>
    </>
  );
}
