import { useCallback, useEffect, useState } from 'react';
import type { Cell } from '../../types';
import { BASE_SCHED, BASE_MEMBER_ROW } from '../../constants/schedule';
import { getISOWeekKey } from '../../utils/schedule/scheduleStorage';
import {
  fetchDraftSchedule,
  fetchPublishedSchedule,
} from '../../utils/schedule/scheduleApi';
import type { ScheduleSnapshot } from '../../utils/schedule/store/types';

function snapshotToCells(s: ScheduleSnapshot | null): { sched: Cell[][]; memberRow: Cell[] } | null {
  if (!s?.data?.length) return null;
  return {
    sched:      s.data as Cell[][],
    memberRow:  (s.memberRow?.length === 7 ? s.memberRow : BASE_MEMBER_ROW) as Cell[],
  };
}

function loadFailureMessage(canManage: boolean): string {
  return canManage
    ? '원격 편성표를 불러오지 못했습니다. 기본 편성을 표시합니다.'
    : '';
}

export function useScheduleLoader(canManage: boolean) {
  const [sched, setSched] = useState<Cell[][]>(BASE_SCHED);
  const [memberRow, setMemberRow] = useState<Cell[]>(BASE_MEMBER_ROW);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (canManage) {
        const draftRes = await fetchDraftSchedule();
        const draftCells = snapshotToCells(draftRes.draft);
        const publishedCells = snapshotToCells(draftRes.published);

        setIsPublished(draftRes.isPublished);
        setPublishedAt(draftRes.publishedAt);
        setHasDraft(Boolean(draftCells));

        if (draftCells) {
          setSched(draftCells.sched);
          setMemberRow(draftCells.memberRow);
        } else if (publishedCells) {
          setSched(publishedCells.sched);
          setMemberRow(publishedCells.memberRow);
        } else {
          setSched(BASE_SCHED);
          setMemberRow(BASE_MEMBER_ROW);
        }
      } else {
        const pub = await fetchPublishedSchedule();
        setIsPublished(pub.published);
        setPublishedAt(pub.publishedAt);
        setHasDraft(false);

        if (pub.published && pub.snapshot) {
          const cells = snapshotToCells(pub.snapshot);
          if (cells) {
            setSched(cells.sched);
            setMemberRow(cells.memberRow);
          } else {
            setSched(BASE_SCHED);
            setMemberRow(BASE_MEMBER_ROW);
          }
        } else {
          setSched(BASE_SCHED);
          setMemberRow(BASE_MEMBER_ROW);
        }
      }
    } catch {
      setError(loadFailureMessage(canManage));
      setSched(BASE_SCHED);
      setMemberRow(BASE_MEMBER_ROW);
    } finally {
      setLoading(false);
    }
  }, [canManage]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError('');
      try {
        if (canManage) {
          const draftRes = await fetchDraftSchedule();
          if (cancelled) return;
          const draftCells = snapshotToCells(draftRes.draft);
          const publishedCells = snapshotToCells(draftRes.published);

          setIsPublished(draftRes.isPublished);
          setPublishedAt(draftRes.publishedAt);
          setHasDraft(Boolean(draftCells));

          if (draftCells) {
            setSched(draftCells.sched);
            setMemberRow(draftCells.memberRow);
          } else if (publishedCells) {
            setSched(publishedCells.sched);
            setMemberRow(publishedCells.memberRow);
          } else {
            setSched(BASE_SCHED);
            setMemberRow(BASE_MEMBER_ROW);
          }
        } else {
          const pub = await fetchPublishedSchedule();
          if (cancelled) return;
          setIsPublished(pub.published);
          setPublishedAt(pub.publishedAt);
          setHasDraft(false);

          if (pub.published && pub.snapshot) {
            const cells = snapshotToCells(pub.snapshot);
            if (cells) {
              setSched(cells.sched);
              setMemberRow(cells.memberRow);
            } else {
              setSched(BASE_SCHED);
              setMemberRow(BASE_MEMBER_ROW);
            }
          } else {
            setSched(BASE_SCHED);
            setMemberRow(BASE_MEMBER_ROW);
          }
        }
      } catch {
        if (!cancelled) {
          setError(loadFailureMessage(canManage));
          setSched(BASE_SCHED);
          setMemberRow(BASE_MEMBER_ROW);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [canManage]);

  const weekKey = getISOWeekKey(new Date());

  return {
    sched,
    setSched,
    memberRow,
    setMemberRow,
    loading,
    error,
    isPublished,
    publishedAt,
    hasDraft,
    weekKey,
    reload,
  };
}
