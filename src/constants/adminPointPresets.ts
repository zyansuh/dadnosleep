import type { PeriodPreset } from '../utils/community/pointPeriod';

export const ADMIN_POINT_PERIOD_PRESETS: { id: PeriodPreset; label: string }[] = [
  { id: 'today',     label: '오늘' },
  { id: '7d',        label: '최근 7일' },
  { id: 'month',     label: '이번 달' },
  { id: 'lastMonth', label: '지난 달' },
  { id: 'all',       label: '전체' },
  { id: 'custom',    label: '직접 지정' },
];
