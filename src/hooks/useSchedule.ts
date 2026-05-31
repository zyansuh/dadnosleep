import { useState } from 'react';
import type { Cell } from '../types';
import { BASE_SCHED } from '../constants/schedule';
import { fetchKoreanOTT } from '../utils/api';

interface UseScheduleReturn {
  sched:           Cell[][];
  randing:         boolean;
  handleRandomize: () => Promise<void>;
}

export function useSchedule(): UseScheduleReturn {
  const [sched,   setSched]   = useState<Cell[][]>(BASE_SCHED);
  const [randing, setRanding] = useState(false);

  const handleRandomize = async () => {
    setRanding(true);
    try {
      const [dramas, movies] = await Promise.all([
        fetchKoreanOTT('tv'),
        fetchKoreanOTT('movie'),
      ]);
      const pool = [...dramas, ...movies].sort(() => Math.random() - 0.5);
      let pi = 0;

      setSched(prev =>
        prev.map(day =>
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
        )
      );
    } catch {
      // API 키 미설정 시 무시
    } finally {
      setRanding(false);
    }
  };

  return { sched, randing, handleRandomize };
}
