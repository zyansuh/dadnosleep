import type { Cell } from '../types';

/** 고정 편성 제외 초기화 시 사용하는 빈 슬롯 */
export const EMPTY_CELL: Cell = {
  title: '',
  sub:   '',
  type:  'empty',
  badge: '',
  bt:    'blue',
};
