// @ts-expect-error tmdb.js는 JS 모듈
import { fetchOTT as _fetchOTT, fetchKoreanOTT as _fetchKoreanOTT } from './tmdb';
// @ts-expect-error youtube.js는 JS 모듈
import { fetchYouTube as _fetchYouTube } from './youtube';
import type { OttItem, RecommendItem } from '../types';
import { ottToRecommend } from './recommend';

export type { OttItem };

export interface YtItem {
  id: string;
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: { medium?: { url?: string } };
  };
  statistics?: { viewCount?: string };
}

const OTT_PROVIDERS = [
  { id: '8',   label: 'Netflix' },
  { id: '337', label: 'Disney+' },
  { id: '356', label: 'wavve' },
  { id: '97',  label: 'Apple TV+' },
] as const;

export async function fetchOTT(providerId: string, contentType: string): Promise<OttItem[]> {
  const results = await _fetchOTT(providerId, contentType);
  return results.map((r: OttItem) => ({
    ...r,
    media_type: contentType as 'movie' | 'tv',
  }));
}

export async function fetchKoreanOTT(contentType: string): Promise<OttItem[]> {
  const results = await _fetchKoreanOTT(contentType);
  return results.map((r: OttItem) => ({
    ...r,
    media_type: contentType as 'movie' | 'tv',
  }));
}

/** 넷플릭스·디즈니+·wavve 등 통합 인기작 */
export async function fetchOttIntegratedList(): Promise<RecommendItem[]> {
  const seen = new Set<number>();
  const items: RecommendItem[] = [];

  await Promise.all(
    OTT_PROVIDERS.map(async ({ id, label }) => {
      try {
        const [movies, shows] = await Promise.all([
          fetchOTT(id, 'movie'),
          fetchOTT(id, 'tv'),
        ]);
        for (const raw of [...movies.slice(0, 5), ...shows.slice(0, 5)]) {
          if (seen.has(raw.id)) continue;
          seen.add(raw.id);
          items.push(ottToRecommend(raw, label));
        }
      } catch {
        /* 플랫폼별 실패 무시 */
      }
    })
  );

  return items.sort((a, b) => (b.voteAverage ?? 0) - (a.voteAverage ?? 0));
}

export async function fetchYouTube(categoryId: string): Promise<YtItem[]> {
  return _fetchYouTube(categoryId);
}
