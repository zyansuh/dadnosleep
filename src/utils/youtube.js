import { ENV } from './env.js';

const BASE = "https://www.googleapis.com/youtube/v3";

export const CATEGORIES = [
  { id: "0",  label: "전체" },
  { id: "23", label: "코미디" },
  { id: "24", label: "엔터테인먼트" },
  { id: "22", label: "인물/블로그" },
  { id: "10", label: "음악" },
  { id: "17", label: "스포츠" },
  { id: "28", label: "과학/기술" },
];

export function formatViews(n) {
  if (!n) return "";
  const num = parseInt(n);
  if (num >= 100000000) return Math.round(num / 100000000) + "억회";
  if (num >= 10000)     return Math.round(num / 10000) + "만회";
  return num.toLocaleString() + "회";
}

export async function fetchYouTube(categoryId) {
  const key = ENV.YOUTUBE_API_KEY;
  let url = `${BASE}/videos?part=snippet,statistics&chart=mostPopular&regionCode=KR&maxResults=50&key=${key}`;
  if (categoryId !== "0") url += `&videoCategoryId=${categoryId}`;

  const res  = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `YouTube 오류 (${res.status})`);
  return data.items || [];
}
