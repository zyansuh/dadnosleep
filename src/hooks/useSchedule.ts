import { useState, useCallback } from 'react';
import type { Cell } from '../types';
import { BASE_SCHED } from '../constants/schedule';
import { fetchKoreanOTT } from '../utils/api';

const LS_KEY = 'dadnosleep-sched';

/** ISO 주차 문자열 반환: "2026-W22" 형태 */
function getISOWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

interface StoredSched {
  week: string;   // "YYYY-Www"
  data: Cell[][];
}

/** localStorage에서 주차 검증 후 편성표 불러오기. 새 주면 기본값 반환 */
function loadSched(): Cell[][] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return BASE_SCHED;
    const stored: StoredSched = JSON.parse(raw);
    const currentWeek = getISOWeekKey(new Date());
    // 저장된 주차와 다르면(= 일요일 기준 새 주) 초기화
    if (stored.week !== currentWeek) {
      localStorage.removeItem(LS_KEY);
      return BASE_SCHED;
    }
    const { data } = stored;
    if (data.length === BASE_SCHED.length && data[0]?.length === BASE_SCHED[0].length) {
      return data;
    }
  } catch {
    // 파싱 실패 시 기본값
  }
  return BASE_SCHED;
}

interface UseScheduleReturn {
  sched:           Cell[][];
  randing:         boolean;
  randError:       string;
  isEditMode:      boolean;
  handleRandomize: () => Promise<void>;
  updateCell:      (dayIdx: number, timeIdx: number, title: string, link?: string) => void;
  updateMany:      (edits: { dayIdx: number; timeIdx: number; title: string; link?: string }[]) => void;
  resetCell:       (dayIdx: number, timeIdx: number) => void;
  toggleEditMode:  () => void;
}

export function useSchedule(): UseScheduleReturn {
  const [sched,      setSched]      = useState<Cell[][]>(loadSched);
  const [randing,    setRanding]    = useState(false);
  const [randError,  setRandError]  = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const persist = useCallback((next: Cell[][]) => {
    try {
      const payload: StoredSched = {
        week: getISOWeekKey(new Date()),
        data: next,
      };
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
    } catch { /* 무시 */ }
  }, []);

  /** 단일 셀 → 고정 편성으로 업데이트 */
  const updateCell = useCallback((dayIdx: number, timeIdx: number, title: string, link?: string) => {
    setSched(prev => {
      const next = prev.map((day, di) =>
        day.map((cell, ti) =>
          di === dayIdx && ti === timeIdx
            ? { ...cell, title, link: link?.trim() || undefined, type: 'fixed' as const, badge: '★ 고정 편성', bt: 'pink' as const }
            : cell
        )
      );
      persist(next);
      return next;
    });
  }, [persist]);

  /** 복수 셀 일괄 업데이트 */
  const updateMany = useCallback(
    (edits: { dayIdx: number; timeIdx: number; title: string; link?: string }[]) => {
      setSched(prev => {
        let next = prev;
        for (const e of edits) {
          next = next.map((day, di) =>
            day.map((cell, ti) =>
              di === e.dayIdx && ti === e.timeIdx
                ? { ...cell, title: e.title, link: e.link, type: 'fixed' as const, badge: '★ 고정 편성', bt: 'pink' as const }
                : cell
            )
          );
        }
        persist(next);
        return next;
      });
    },
    [persist]
  );

  /** 셀 기본값으로 초기화 */
  const resetCell = useCallback((dayIdx: number, timeIdx: number) => {
    setSched(prev => {
      const next = prev.map((day, di) =>
        day.map((cell, ti) =>
          di === dayIdx && ti === timeIdx ? BASE_SCHED[di][ti] : cell
        )
      );
      persist(next);
      return next;
    });
  }, [persist]);

  const toggleEditMode = useCallback(() => setIsEditMode(v => !v), []);

  /** 랜덤 편성 생성 (한국어 콘텐츠) */
  const handleRandomize = async () => {
    setRanding(true);
    setRandError('');
    try {
      const [dramas, movies] = await Promise.all([
        fetchKoreanOTT('tv'),
        fetchKoreanOTT('movie'),
      ]);

      const pool = [...dramas, ...movies];

      if (pool.length === 0) {
        setRandError('콘텐츠를 불러오지 못했습니다. Vercel 환경변수(VITE_TMDB_READ_TOKEN)를 확인하고 재배포해주세요.');
        return;
      }
      pool.sort(() => Math.random() - 0.5);
      let pi = 0;
      setSched(prev => {
        const next = prev.map(day =>
          day.map(cell => {
            if (cell.type === 'fixed') return cell;
            const item = pool[pi++];
            if (!item) return cell;
            return {
              ...cell,
              title: ((item.title || item.name || cell.title) as string).slice(0, 11),
              sub:   'TMDB 한국 추천',
              link:  `https://www.themoviedb.org/${item.title ? 'movie' : 'tv'}/${item.id}`,
            };
          })
        );
        persist(next);
        return next;
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[랜덤 편성]', msg);
      setRandError(`오류: ${msg} — Vercel 재배포 후 다시 시도해주세요.`);
    } finally { setRanding(false); }
  };

  return { sched, randing, randError, isEditMode, handleRandomize, updateCell, updateMany, resetCell, toggleEditMode };
}
