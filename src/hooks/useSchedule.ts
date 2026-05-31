import { useState, useCallback } from 'react';
import type { Cell } from '../types';
import { BASE_SCHED } from '../constants/schedule';
import { fetchKoreanOTT } from '../utils/api';

const LS_KEY = 'dadnosleep-sched';

/** localStorage에서 저장된 편성표를 불러옴. 없으면 기본 데이터 반환 */
function loadSched(): Cell[][] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return BASE_SCHED;
    const parsed: Cell[][] = JSON.parse(raw);
    // 행/열 크기가 맞을 때만 복원
    if (parsed.length === BASE_SCHED.length && parsed[0]?.length === BASE_SCHED[0].length) {
      return parsed;
    }
  } catch {
    // 파싱 실패 시 기본값
  }
  return BASE_SCHED;
}

interface UseScheduleReturn {
  sched:           Cell[][];
  randing:         boolean;
  isEditMode:      boolean;
  handleRandomize: () => Promise<void>;
  updateCell:      (dayIdx: number, timeIdx: number, title: string, link?: string) => void;
  resetCell:       (dayIdx: number, timeIdx: number) => void;
  toggleEditMode:  () => void;
}

export function useSchedule(): UseScheduleReturn {
  const [sched,      setSched]      = useState<Cell[][]>(loadSched);
  const [randing,    setRanding]    = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const persist = useCallback((next: Cell[][]) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* 무시 */ }
  }, []);

  /** 셀을 고정 편성으로 업데이트 */
  const updateCell = useCallback((dayIdx: number, timeIdx: number, title: string, link?: string) => {
    setSched(prev => {
      const next = prev.map((day, di) =>
        day.map((cell, ti) => {
          if (di === dayIdx && ti === timeIdx) {
            return {
              ...cell,
              title,
              link:  link?.trim() || undefined,
              type:  'fixed' as const,
              badge: '★ 고정 편성',
              bt:    'pink' as const,
            };
          }
          return cell;
        })
      );
      persist(next);
      return next;
    });
  }, [persist]);

  /** 셀을 기본 데이터로 초기화 */
  const resetCell = useCallback((dayIdx: number, timeIdx: number) => {
    setSched(prev => {
      const next = prev.map((day, di) =>
        day.map((cell, ti) => {
          if (di === dayIdx && ti === timeIdx) {
            return BASE_SCHED[di][ti];
          }
          return cell;
        })
      );
      persist(next);
      return next;
    });
  }, [persist]);

  const toggleEditMode = useCallback(() => setIsEditMode(v => !v), []);

  /** 랜덤 편성 생성 (한국어 콘텐츠만) */
  const handleRandomize = async () => {
    setRanding(true);
    try {
      const [dramas, movies] = await Promise.all([
        fetchKoreanOTT('tv'),
        fetchKoreanOTT('movie'),
      ]);
      const pool = [...dramas, ...movies].sort(() => Math.random() - 0.5);
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
    } catch {
      // API 키 미설정 시 무시
    } finally {
      setRanding(false);
    }
  };

  return { sched, randing, isEditMode, handleRandomize, updateCell, resetCell, toggleEditMode };
}
