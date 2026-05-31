/**
 * API 키 설정 파일
 *
 * 사용 방법:
 *  1. TMDB 키  → https://www.themoviedb.org/settings/api 에서 발급
 *  2. YouTube 키 → https://console.cloud.google.com 에서 YouTube Data API v3 활성화 후 발급
 *  3. 아래 빈 문자열("")에 각 키를 붙여 넣기
 *
 * ⚠️  이 파일은 .gitignore 에 추가하여 키가 외부에 노출되지 않도록 주의하세요.
 */
const config = {
  TMDB_API_KEY:    "",   // TMDB API v3 키
  YOUTUBE_API_KEY: "",   // Google YouTube Data API v3 키
};

export default config;
