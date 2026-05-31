import config from "../config";

const BASE = "https://api.themoviedb.org/3";
const IMG  = "https://image.tmdb.org/t/p/w300";

export const PROVIDERS = [
  { id: "8",   label: "Netflix" },
  { id: "337", label: "Disney+" },
  { id: "356", label: "wavve" },
  { id: "97",  label: "Apple TV+" },
  { id: "0",   label: "전체 인기" },
];

export const CONTENT_TYPES = [
  { id: "movie", label: "영화" },
  { id: "tv",    label: "드라마/TV" },
];

export function getPosterUrl(path) {
  return path ? `${IMG}${path}` : null;
}

function getHeaders() {
  const token = config.TMDB_READ_TOKEN;
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }
  return {};
}

/** 한국어 원작 콘텐츠만 조회 (with_original_language=ko) */
export async function fetchKoreanOTT(contentType) {
  const headers   = getHeaders();
  const useBearer = !!config.TMDB_READ_TOKEN;
  const keyParam  = useBearer ? "" : `api_key=${config.TMDB_API_KEY}&`;

  const url = `${BASE}/discover/${contentType}?${keyParam}language=ko-KR&with_original_language=ko&sort_by=popularity.desc&vote_count.gte=10&page=1`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`TMDB 오류 (${res.status})`);
  const data = await res.json();
  return data.results || [];
}

/** OTT 플랫폼 or 전체 인기 콘텐츠 조회 */
export async function fetchOTT(providerId, contentType) {
  const headers   = getHeaders();
  const useBearer = !!config.TMDB_READ_TOKEN;
  const keyParam  = useBearer ? "" : `api_key=${config.TMDB_API_KEY}&`;

  let url;
  if (providerId === "0") {
    url = `${BASE}/${contentType}/popular?${keyParam}language=ko-KR&region=KR&page=1`;
  } else {
    url = `${BASE}/discover/${contentType}?${keyParam}language=ko-KR&watch_region=KR&with_watch_providers=${providerId}&sort_by=popularity.desc&page=1`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`TMDB 오류 (${res.status}) — API 키/토큰을 확인해주세요`);
  const data = await res.json();
  return data.results || [];
}
