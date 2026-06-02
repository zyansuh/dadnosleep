import type { Review, FriendInvite, PointRecord } from '../../types/community';
import type { MemberEntry } from '../../types/member';
import { POINTS_PER_FRIEND_INVITE, POINTS_PER_REVIEW } from '../../constants/points';
import { recalcPoints, formatPointBreakdown } from './pointCalc';
import { displayMemberNickname } from '../members/memberDisplay';

export type PeriodPreset = 'today' | '7d' | 'month' | 'lastMonth' | 'all' | 'custom';

/** 관리자 기간별 포인트 조회 모드 */
export type PointPeriodView = 'total' | 'review' | 'invite';

export interface PeriodRange {
  preset:     PeriodPreset;
  start:      Date | null;
  end:        Date | null;
  label:      string;
  startInput: string;
  endInput:   string;
}

export interface PointPeriodRow extends PointRecord {
  /** 동호회 명단에 등록된 회원이면 표시 이름 */
  memberLabel?: string;
  isRegistered: boolean;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function toDateInputValue(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function parseDateInput(value: string, endOfDayFlag: boolean): Date | null {
  if (!value.trim()) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return endOfDayFlag ? endOfDay(new Date(y, m - 1, d)) : startOfDay(new Date(y, m - 1, d));
}

export function isInPeriod(iso: string, start: Date | null, end: Date | null): boolean {
  if (!start && !end) return true;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  if (start && t < start.getTime()) return false;
  if (end && t > end.getTime()) return false;
  return true;
}

export function buildPeriodRange(
  preset: PeriodPreset,
  customStart?: string,
  customEnd?: string,
): PeriodRange {
  const now = new Date();
  const today = toDateInputValue(now);

  if (preset === 'all') {
    return {
      preset,
      start: null,
      end: null,
      label: '전체 기간',
      startInput: '',
      endInput: '',
    };
  }

  if (preset === 'custom') {
    const start = parseDateInput(customStart ?? '', false);
    const end = parseDateInput(customEnd ?? '', true);
    const label = start && end
      ? `${customStart} ~ ${customEnd}`
      : start
        ? `${customStart} ~`
        : end
          ? `~ ${customEnd}`
          : '기간 지정';
    return {
      preset,
      start,
      end,
      label,
      startInput: customStart ?? '',
      endInput: customEnd ?? '',
    };
  }

  if (preset === 'today') {
    const s = startOfDay(now);
    const e = endOfDay(now);
    return {
      preset,
      start: s,
      end: e,
      label: '오늘',
      startInput: today,
      endInput: today,
    };
  }

  if (preset === '7d') {
    const s = startOfDay(new Date(now));
    s.setDate(s.getDate() - 6);
    return {
      preset,
      start: s,
      end: endOfDay(now),
      label: '최근 7일',
      startInput: toDateInputValue(s),
      endInput: today,
    };
  }

  if (preset === 'month') {
    const s = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    return {
      preset,
      start: s,
      end: endOfDay(now),
      label: '이번 달',
      startInput: toDateInputValue(s),
      endInput: today,
    };
  }

  // lastMonth
  const y = now.getFullYear();
  const m = now.getMonth();
  const s = startOfDay(new Date(y, m - 1, 1));
  const e = endOfDay(new Date(y, m, 0));
  return {
    preset,
    start: s,
    end: e,
    label: '지난 달',
    startInput: toDateInputValue(s),
    endInput: toDateInputValue(e),
  };
}

export function filterReviewsByPeriod(reviews: Review[], range: PeriodRange): Review[] {
  return reviews.filter(r => isInPeriod(r.createdAt, range.start, range.end));
}

export function filterInvitesByPeriod(invites: FriendInvite[], range: PeriodRange): FriendInvite[] {
  return invites.filter(inv => isInPeriod(inv.createdAt, range.start, range.end));
}

function memberMatchKeys(m: MemberEntry): string[] {
  return [m.nickname, m.globalName, m.username]
    .map(s => s?.trim().toLowerCase())
    .filter((s): s is string => Boolean(s));
}

function rowMatchesMember(row: PointRecord, m: MemberEntry): boolean {
  const nick = row.nickname.trim().toLowerCase();
  return memberMatchKeys(m).includes(nick);
}

/** 기간 내 활동 기준 포인트 집계 (합산) */
export function calcPointsForPeriod(
  reviews: Review[],
  friendInvites: FriendInvite[],
  range: PeriodRange,
): PointRecord[] {
  const filteredReviews = filterReviewsByPeriod(reviews, range);
  const filteredInvites = filterInvitesByPeriod(friendInvites, range);
  return recalcPoints(filteredReviews, filteredInvites);
}

/** 후기만 */
export function calcReviewPointsForPeriod(reviews: Review[], range: PeriodRange): PointRecord[] {
  return recalcPoints(filterReviewsByPeriod(reviews, range), []);
}

/** 지인 초대만 */
export function calcInvitePointsForPeriod(
  friendInvites: FriendInvite[],
  range: PeriodRange,
): PointRecord[] {
  return recalcPoints([], filterInvitesByPeriod(friendInvites, range));
}

export function activityRowsForView(
  reviews: Review[],
  friendInvites: FriendInvite[],
  range: PeriodRange,
  view: PointPeriodView,
): PointRecord[] {
  if (view === 'review') return calcReviewPointsForPeriod(reviews, range);
  if (view === 'invite') return calcInvitePointsForPeriod(friendInvites, range);
  return calcPointsForPeriod(reviews, friendInvites, range);
}

export function buildRowsForView(
  members: MemberEntry[],
  activityRows: PointRecord[],
  registeredOnly: boolean,
  view: PointPeriodView,
): PointPeriodRow[] {
  const rows = registeredOnly
    ? buildRegisteredMemberRows(members, activityRows)
    : buildActivityRows(activityRows, members);

  const sortKey = (r: PointPeriodRow) => {
    if (view === 'review') return r.reviewCount * POINTS_PER_REVIEW;
    if (view === 'invite') return r.inviteCount * POINTS_PER_FRIEND_INVITE;
    return r.points;
  };

  return [...rows].sort((a, b) => sortKey(b) - sortKey(a));
}

export function activeCountForView(rows: PointPeriodRow[], view: PointPeriodView): number {
  if (view === 'review') return rows.filter(r => r.reviewCount > 0).length;
  if (view === 'invite') return rows.filter(r => r.inviteCount > 0).length;
  return rows.filter(r => r.points > 0).length;
}

export function sumReviewPoints(rows: PointPeriodRow[]): number {
  return rows.reduce((acc, r) => acc + r.reviewCount * POINTS_PER_REVIEW, 0);
}

export function sumInvitePoints(rows: PointPeriodRow[]): number {
  return rows.reduce((acc, r) => acc + r.inviteCount * POINTS_PER_FRIEND_INVITE, 0);
}

/** 등록 회원 명단 기준 행 (기간 내 0P 포함) */
export function buildRegisteredMemberRows(
  members: MemberEntry[],
  activityRows: PointRecord[],
): PointPeriodRow[] {
  const used = new Set<PointRecord>();

  const rows: PointPeriodRow[] = members.map(m => {
    const match = activityRows.find(r => {
      if (used.has(r)) return false;
      if (rowMatchesMember(r, m)) {
        used.add(r);
        return true;
      }
      return false;
    });
    const label = displayMemberNickname(m);
    if (match) {
      return {
        ...match,
        memberLabel: label,
        isRegistered: true,
      };
    }
    return {
      nickname:     label,
      reviewCount:  0,
      inviteCount:  0,
      points:       0,
      memberLabel:  label,
      isRegistered: true,
    };
  });

  for (const r of activityRows) {
    if (used.has(r)) continue;
    rows.push({
      ...r,
      isRegistered: false,
    });
  }

  return rows.sort((a, b) => b.points - a.points);
}

/** 모든 닉네임 활동 (미등록 포함) */
export function buildActivityRows(
  activityRows: PointRecord[],
  members: MemberEntry[],
): PointPeriodRow[] {
  return activityRows
    .map(r => {
      const member = members.find(m => rowMatchesMember(r, m));
      return {
        ...r,
        memberLabel: member ? displayMemberNickname(member) : undefined,
        isRegistered: Boolean(member),
      };
    })
    .sort((a, b) => b.points - a.points);
}

export function sumPeriodPoints(rows: PointPeriodRow[]): number {
  return rows.reduce((acc, r) => acc + r.points, 0);
}

export { formatPointBreakdown };
