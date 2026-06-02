import type { Cell } from '../../../types';

export interface StoredSched {
  week:       string;
  data:       Cell[][];
  memberRow?: Cell[];
}
