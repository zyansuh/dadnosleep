import type { Cell, RecommendItem } from '../../types';
import { EMPTY_CELL } from '../../constants/emptyCell';
import { BASE_SCHED } from '../../constants/schedule';

function touchUpdatedAt(cell: Cell): Cell {
  return { ...cell, updatedAt: new Date().toISOString() };
}

export function patchCellContent(cell: Cell, title: string, link?: string): Cell {
  return touchUpdatedAt({
    ...cell,
    title,
    link: link?.trim() || undefined,
    type: cell.type === 'empty' ? 'ott' : cell.type,
  });
}

export function toFixedCell(cell: Cell, title: string, link?: string): Cell {
  return {
    ...cell,
    title,
    link: link?.trim() || undefined,
    type:  'fixed',
    badge: '★ 고정 편성',
    bt:    'pink',
  };
}

export function toUnfixedCell(cell: Cell): Cell {
  return {
    ...cell,
    type:  'ott',
    badge: 'OTT',
    bt:    'blue',
    sub:   cell.sub || 'OTT 추천',
  };
}

export function recommendToCell(cell: Cell, item: RecommendItem): Cell {
  return touchUpdatedAt({
    ...cell,
    type:  'random',
    title: item.title.slice(0, 11),
    sub:   item.platform,
    badge: '편성 추천',
    bt:    'pink',
    link:  item.link,
  });
}

export function touchMemberCell(cell: Cell, title: string, link?: string): Cell {
  return touchUpdatedAt({
    ...cell,
    title,
    link: link?.trim() || undefined,
    type: 'member' as const,
  });
}

export function resetCellToBase(dayIdx: number, timeIdx: number): Cell {
  return BASE_SCHED[dayIdx][timeIdx];
}

export function emptyNonFixedCell(cell: Cell): Cell {
  return cell.type === 'fixed' ? cell : { ...EMPTY_CELL };
}
