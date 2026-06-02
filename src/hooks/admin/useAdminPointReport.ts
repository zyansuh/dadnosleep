import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Review, FriendInvite } from '../../types/community';
import type { MemberEntry } from '../../types/member';
import { loadCommunityData } from '../../utils/community/communityStore';
import { loadMembersBin } from '../../utils/members/membersStore';
import { toUserFacingError } from '../../utils/messages/userMessages';
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
  type PointPeriodRow,
  type PointPeriodView,
} from '../../utils/community/pointPeriod';

export function useAdminPointReport() {
  const [reviews, setReviews]               = useState<Review[]>([]);
  const [friendInvites, setFriendInvites]   = useState<FriendInvite[]>([]);
  const [members, setMembers]               = useState<MemberEntry[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  const [preset, setPreset]                 = useState<PeriodPreset>('month');
  const [customStart, setCustomStart]       = useState('');
  const [customEnd, setCustomEnd]           = useState('');
  const [registeredOnly, setRegisteredOnly] = useState(true);
  const [view, setView]                     = useState<PointPeriodView>('total');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [community, memberData] = await Promise.all([
        loadCommunityData(),
        loadMembersBin({ forAdmin: true }).catch(() => ({ members: [] as MemberEntry[] })),
      ]);
      setReviews(community.reviews);
      setFriendInvites(community.friendInvites);
      setMembers(memberData.members);
    } catch (e) {
      setError(toUserFacingError(e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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

  const rows: PointPeriodRow[] = useMemo(
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

  const periodInviteCount = periodInvites.length;

  const totalReviewPoints = useMemo(() => sumReviewPoints(totalRows), [totalRows]);
  const totalInvitePoints = useMemo(() => sumInvitePoints(totalRows), [totalRows]);

  return {
    loading,
    error,
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
    periodInviteCount,
    periodInvites,
    totalReviewPoints,
    totalInvitePoints,
    memberCount: members.length,
    reload: load,
  };
}
