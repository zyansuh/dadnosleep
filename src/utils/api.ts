// @ts-ignore
import { fetchOTT as _fetchOTT } from './tmdb';
// @ts-ignore
import { fetchYouTube as _fetchYouTube } from './youtube';

export interface OttItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
}

export interface YtItem {
  id: string;
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: {
      medium?: { url?: string };
    };
  };
  statistics?: {
    viewCount?: string;
  };
}

export async function fetchOTT(
  providerId: string,
  contentType: string
): Promise<OttItem[]> {
  return _fetchOTT(providerId, contentType);
}

export async function fetchYouTube(categoryId: string): Promise<YtItem[]> {
  return _fetchYouTube(categoryId);
}
