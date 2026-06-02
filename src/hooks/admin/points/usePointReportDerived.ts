import { useMemo, useState } from 'react';
import type { Review, FriendInvite } from '../../../types/community';
import type { MemberEntry } from '../../../types/member';
import {
  activityRowsForView,
  buildPeriodRange,
  buildRowsForView,
  activeCountForView,
  calcPointsForPeriod,
  filterInvitesByPeriod,
  filterReviewsByPeriod,
  sumInvitePoints,
  sumPeriodPoints,
  sumReviewPoints,
  type PeriodPreset,
  type PeriodRange,
  type PointPeriodView,
} from '../../../utils/community/pointPeriod';

export function usePointReportDerived(
  reviews: Review[],
  friendInvites: FriendInvite[],
  members: MemberEntry[],
) {
  const [preset, setPreset]                 = useState<PeriodPreset>('month');
  const [customStart, setCustomStart]       = useState('');
  const [customEnd, setCustomEnd]           = useState('');
  const [registeredOnly, setRegisteredOnly] = useState(true);
  const [view, setView]                     = useState<PointPeriodView>('total');

  const range: PeriodRange = useMemo(
    () => buildPeriodRange(preset, customStart, customEnd),
    [preset, customStart, customEnd],
  );

  const totalActivityRows = useMemo(
    () => calcPointsForPeriod(reviews, friendInvites, range),
    [reviews, friendInvites, range],
  );

  const viewActivityRows = useMemo(
    () => activityRowsForView(reviews, friendInvites, range, view),
    [reviews, friendInvites, range, view],
  );

  const rows = useMemo(
    () => buildRowsForView(members, viewActivityRows, registeredOnly, view),
    [members, viewActivityRows, registeredOnly, view],
  );

  const totalRows = useMemo(
    () => buildRowsForView(members, totalActivityRows, registeredOnly, 'total'),
    [members, totalActivityRows, registeredOnly],
  );

  const activeCount = useMemo(() => activeCountForView(rows, view), [rows, view]);

  const displayPoints = useMemo(() => {
    if (view === 'review') return sumReviewPoints(rows);
    if (view === 'invite') return sumInvitePoints(rows);
    return sumPeriodPoints(rows);
  }, [rows, view]);

  const periodReviewCount = useMemo(
    () => filterReviewsByPeriod(reviews, range).length,
    [reviews, range],
  );

  const periodInvites = useMemo(
    () => filterInvitesByPeriod(friendInvites, range),
    [friendInvites, range],
  );

  const totalReviewPoints = useMemo(() => sumReviewPoints(totalRows), [totalRows]);
  const totalInvitePoints = useMemo(() => sumInvitePoints(totalRows), [totalRows]);

  return {
    preset,
    setPreset,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    registeredOnly,
    setRegisteredOnly,
    view,
    setView,
    range,
    rows,
    activeCount,
    displayPoints,
    periodReviewCount,
    periodInviteCount: periodInvites.length,
    periodInvites,
    totalReviewPoints,
    totalInvitePoints,
    memberCount: members.length,
  };
}
