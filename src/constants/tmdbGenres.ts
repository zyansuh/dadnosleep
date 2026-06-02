/** TMDB 장르 ID → 한국어 라벨 */
export const TMDB_GENRE_KO: Record<number, string> = {
  28: '액션', 12: '모험', 16: '애니메이션', 35: '코미디', 80: '범죄',
  99: '다큐', 18: '드라마', 10751: '가족', 14: '판타지', 36: '역사',
  27: '공포', 10402: '음악', 9648: '미스터리', 10749: '로맨스',
  878: 'SF', 10770: 'TV영화', 53: '스릴러', 10752: '전쟁', 37: '서부',
  10759: '액션·SF', 10762: '키즈', 10763: '뉴스', 10764: '리얼리티',
  10765: 'SF·판타지', 10766: '연속극', 10767: '토크', 10768: '전쟁·정치',
};

export function genreLabel(ids?: number[]): string {
  if (!ids?.length) return '장르 미상';
  return ids.slice(0, 2).map(id => TMDB_GENRE_KO[id] ?? '').filter(Boolean).join(' · ') || '장르 미상';
}
