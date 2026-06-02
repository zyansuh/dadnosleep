import type { UserRole } from './role';

export interface MemberEntry {
  discordId:  string;
  username:   string;
  globalName: string;
  nickname:   string;
  avatar:     string;
  role:       'member';
  joinedAt:   string;
  /** VIP — 회원 전용 편성 열람·후기/랭킹 왕관 표시 */
  isVip:      boolean;
}

export interface MembersBinRecord {
  members: MemberEntry[];
}

export interface DiscordLoginProfile {
  id:           string;
  username:     string;
  global_name?: string | null;
  avatar?:      string | null;
}

export interface LoginProcessResult {
  role:     UserRole;
  nickname: string;
  isVip:    boolean;
  profile:  DiscordLoginProfile;
}
