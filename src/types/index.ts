export type BadgeType = 'pink' | 'teal' | 'purple' | 'orange' | 'green' | 'yellow' | 'blue';
export type CellType  = 'fixed' | 'ott' | 'random' | 'community' | 'empty' | 'member';
export type ApiType   = 'netflix' | 'ott' | 'youtube';

export interface Cell {
  title:      string;
  sub:        string;
  type:       CellType;
  badge:      string;
  bt:         BadgeType;
  link?:      string;
  updatedAt?: string;
}

export type { SuggForm } from './suggestion';

export interface OttItem {
  id:              number;
  title?:          string;
  name?:           string;
  poster_path?:    string;
  vote_average?:   number;
  release_date?:   string;
  first_air_date?: string;
  genre_ids?:      number[];
  media_type?:     'movie' | 'tv';
  platform?:       string;
}

/** 편성 추천·드로어 공통 항목 */
export interface RecommendItem {
  id:           string;
  title:        string;
  mediaType:    'movie' | 'tv';
  genre:        string;
  platform:     string;
  link:         string;
  posterPath?:  string;
  voteAverage?: number;
}

export interface YtItem {
  id: string;
  snippet?: {
    title?:        string;
    channelTitle?: string;
    thumbnails?:   { medium?: { url?: string } };
  };
  statistics?: { viewCount?: string };
}
