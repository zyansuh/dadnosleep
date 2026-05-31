import { useState } from 'react';
import type { ApiType, OttItem, YtItem } from '../types';
import { fetchOTT, fetchYouTube } from '../utils/api';

interface UseApiCardsReturn {
  activeApi:   ApiType | null;
  ottItems:    OttItem[];
  ytItems:     YtItem[];
  ottLoading:  boolean;
  ottError:    string;
  handleApiCard: (type: ApiType) => Promise<void>;
}

export function useApiCards(): UseApiCardsReturn {
  const [activeApi,  setActiveApi]  = useState<ApiType | null>(null);
  const [ottItems,   setOttItems]   = useState<OttItem[]>([]);
  const [ytItems,    setYtItems]    = useState<YtItem[]>([]);
  const [ottLoading, setOttLoading] = useState(false);
  const [ottError,   setOttError]   = useState('');

  const handleApiCard = async (type: ApiType) => {
    if (activeApi === type) {
      setActiveApi(null);
      return;
    }

    setActiveApi(type);
    setOttLoading(true);
    setOttError('');
    setOttItems([]);
    setYtItems([]);

    try {
      if (type === 'youtube') {
        const videos = await fetchYouTube('0');
        setYtItems(videos.slice(0, 12));
      } else {
        const pid = type === 'netflix' ? '8' : '0';
        const [movies, shows] = await Promise.all([
          fetchOTT(pid, 'movie'),
          fetchOTT(pid, 'tv'),
        ]);
        setOttItems([...movies.slice(0, 5), ...shows.slice(0, 5)]);
      }
    } catch (e) {
      setOttError(
        e instanceof Error ? e.message : 'API 키를 config.js에 입력해주세요'
      );
    } finally {
      setOttLoading(false);
    }
  };

  return { activeApi, ottItems, ytItems, ottLoading, ottError, handleApiCard };
}
