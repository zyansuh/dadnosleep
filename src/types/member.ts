import type { UserRole } from './role';

export interface MemberEntry {
  discordId:  string;
  username:   string;
  globalName: string;
  nickname:   string;
  avatar:     string;
  role:       'member';
  joinedAt:   string;
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
  profile:  DiscordLoginProfile;
}
