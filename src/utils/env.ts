/** Vite 환경변수 → 통합 API 설정 */
export const ENV = {
  TMDB_API_KEY:    (import.meta.env.VITE_TMDB_API_KEY    as string) ?? '',
  TMDB_READ_TOKEN: (import.meta.env.VITE_TMDB_READ_TOKEN as string) ?? '',
  YOUTUBE_API_KEY: (import.meta.env.VITE_YOUTUBE_API_KEY as string) ?? '',
};
