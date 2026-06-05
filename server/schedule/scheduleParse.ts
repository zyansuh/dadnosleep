import type { ScheduleRemoteRecord, ScheduleSnapshot } from './types';

export function parseScheduleField(raw: unknown): ScheduleRemoteRecord {
  if (!raw || typeof raw !== 'object') return {};
  return raw as ScheduleRemoteRecord;
}

export function isValidSnapshot(s: unknown): s is ScheduleSnapshot {
  if (!s || typeof s !== 'object') return false;
  const o = s as ScheduleSnapshot;
  return typeof o.week === 'string'
    && Array.isArray(o.data)
    && Array.isArray(o.memberRow);
}
