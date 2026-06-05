import type { OttItem, RecommendItem } from '../../types';
import { genreLabel } from '../../constants/tmdbGenres';
import { fetchKoreanOTT } from '../api';

export function ottToRecommend(item: OttItem, platform = 'TMDB 한국'): RecommendItem {
  const mediaType = item.media_type ?? (item.title ? 'movie' : 'tv');
  const title = (item.title || item.name || '제목 없음').slice(0, 30);
  return {
    id:           `${mediaType}-${item.id}`,
    title,
    mediaType,
    genre:        genreLabel(item.genre_ids),
    platform,
    link:         `https://www.themoviedb.org/${mediaType}/${item.id}`,
    posterPath:   item.poster_path,
    voteAverage:  item.vote_average,
  };
}

export async function fetchRandomRecommendPool(count = 24): Promise<RecommendItem[]> {
  const [dramas, movies] = await Promise.all([
    fetchKoreanOTT('tv'),
    fetchKoreanOTT('movie'),
  ]);
  const pool = [...dramas, ...movies].map(i => ottToRecommend(i, 'TMDB 한국'));
  pool.sort(() => Math.random() - 0.5);
  return pool.slice(0, count);
}
