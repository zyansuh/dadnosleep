// @ts-ignore
import { fetchOTT as _fetchOTT } from './tmdb';

export interface OttItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
}

export async function fetchOTT(
  providerId: string,
  contentType: string
): Promise<OttItem[]> {
  return _fetchOTT(providerId, contentType);
}
