export type BadgeType = 'pink' | 'teal' | 'purple' | 'orange' | 'green' | 'yellow' | 'blue';
export type CellType  = 'fixed' | 'ott' | 'random' | 'community';
export type ApiType   = 'netflix' | 'ott' | 'youtube';

export interface Cell {
  title: string;
  sub:   string;
  type:  CellType;
  badge: string;
  bt:    BadgeType;
  link?: string;
}

export interface SuggForm {
  title:    string;
  category: string;
  time:     string;
  desc:     string;
  nick:     string;
}

export interface OttItem {
  id:              number;
  title?:          string;
  name?:           string;
  poster_path?:    string;
  vote_average?:   number;
  release_date?:   string;
  first_air_date?: string;
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
