import { useState, useCallback } from 'react';
import type { ApiType, RecommendItem } from '../types';
import { fetchOTT, fetchYouTube, fetchOttIntegratedList } from '../utils/api';
import { fetchRandomRecommendPool } from '../utils/recommend';
import type { OttItem, YtItem } from '../utils/api';

export type DrawerMode = 'ott' | 'random' | null;

interface UseApiCardsReturn {
  activeApi:        ApiType | null;
  ottItems:         OttItem[];
  ytItems:          YtItem[];
  ottLoading:       boolean;
  ottError:         string;
  drawerMode:       DrawerMode;
  drawerItems:      RecommendItem[];
  drawerLoading:    boolean;
  drawerError:      string;
  handleApiCard:    (type: ApiType) => Promise<void>;
  openOttDrawer:    () => Promise<void>;
  openRandomDrawer: () => Promise<void>;
  closeDrawer:      () => void;
}

export function useApiCards(): UseApiCardsReturn {
  const [activeApi,     setActiveApi]     = useState<ApiType | null>(null);
  const [ottItems,      setOttItems]      = useState<OttItem[]>([]);
  const [ytItems,       setYtItems]       = useState<YtItem[]>([]);
  const [ottLoading,    setOttLoading]    = useState(false);
  const [ottError,      setOttError]      = useState('');
  const [drawerMode,    setDrawerMode]    = useState<DrawerMode>(null);
  const [drawerItems,   setDrawerItems]   = useState<RecommendItem[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError,   setDrawerError]   = useState('');

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
      setOttError(e instanceof Error ? e.message : 'API 키를 확인해주세요');
    } finally {
      setOttLoading(false);
    }
  };

  const openOttDrawer = useCallback(async () => {
    setDrawerMode('ott');
    setDrawerLoading(true);
    setDrawerError('');
    setDrawerItems([]);
    try {
      const items = await fetchOttIntegratedList();
      setDrawerItems(items);
      if (!items.length) setDrawerError('인기작을 불러오지 못했습니다.');
    } catch (e) {
      setDrawerError(e instanceof Error ? e.message : 'API 오류');
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  const openRandomDrawer = useCallback(async () => {
    setDrawerMode('random');
    setDrawerLoading(true);
    setDrawerError('');
    setDrawerItems([]);
    try {
      const items = await fetchRandomRecommendPool(30);
      setDrawerItems(items);
      if (!items.length) setDrawerError('추천 목록을 불러오지 못했습니다.');
    } catch (e) {
      setDrawerError(e instanceof Error ? e.message : 'API 오류');
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerMode(null);
    setDrawerItems([]);
    setDrawerError('');
  }, []);

  return {
    activeApi, ottItems, ytItems, ottLoading, ottError,
    drawerMode, drawerItems, drawerLoading, drawerError,
    handleApiCard, openOttDrawer, openRandomDrawer, closeDrawer,
  };
}
