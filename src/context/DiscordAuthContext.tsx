import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearDiscordSession,
  discordAvatarUrl,
  getDiscordSession,
  getDisplayName,
  getSessionRole,
  isDiscordLoggedIn,
  setSessionNickname,
  type DiscordSessionUser,
} from '../utils/auth/discordSession';
import { isAdminSession } from '../utils/auth/adminSession';
import type { UserRole } from '../types/role';
import { canAccessVipSchedule } from '../types/role';
import { updateMemberNickname } from '../utils/members/membersStore';
import { buildDiscordAuthorizeUrl } from '../utils/auth/discordOAuth';
import { clearAdminApiToken } from '../utils/admin/adminApiToken';

interface DiscordAuthContextValue {
  user:                   DiscordSessionUser | null;
  role:                   UserRole;
  isLoggedIn:             boolean;
  isAdmin:                boolean;
  /** 편성표 생성·수정·삭제·공개 (Discord 관리자 username만) */
  canEditSchedule:        boolean;
  isMember:               boolean;
  isVip:                  boolean;
  canAccessMemberContent: boolean;
  canAccessVipSchedule:   boolean;
  isGuestLoggedIn:        boolean;
  canChangeNickname:      boolean;
  displayName:            string | null;
  avatarUrl:              string | null;
  login:                  () => void;
  logout:                 () => void;
  refresh:                () => void;
  updateNickname:         (nickname: string) => Promise<void>;
}

const DiscordAuthContext = createContext<DiscordAuthContextValue | null>(null);

export function DiscordAuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<DiscordSessionUser | null>(() => getDiscordSession());
  const [role, setRole] = useState<UserRole>(() => getSessionRole());
  const [passwordAdmin, setPasswordAdmin] = useState(() => isAdminSession());

  const refresh = useCallback(() => {
    setUser(getDiscordSession());
    setRole(getSessionRole());
    setPasswordAdmin(isAdminSession());
  }, []);

  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  const login = useCallback(() => {
    window.location.href = buildDiscordAuthorizeUrl();
  }, []);

  const logout = useCallback(() => {
    clearDiscordSession();
    clearAdminApiToken();
    setUser(null);
    setRole('guest');
    setPasswordAdmin(false);
    navigate('/', { replace: true });
  }, [navigate]);

  const updateNickname = useCallback(async (nickname: string) => {
    if (!user || role !== 'member') {
      throw new Error('동호회 회원만 닉네임을 변경할 수 있습니다.');
    }
    await updateMemberNickname(user.discordId, user.username, nickname);
    setSessionNickname(nickname);
    refresh();
  }, [user, role, refresh]);

  const isAdmin = role === 'admin' || passwordAdmin;
  const canEditSchedule = role === 'admin';
  const isVip = user?.isVip ?? false;
  const vipAccess = canAccessVipSchedule(role, isVip, { passwordAdmin });
  const canChangeNickname = role === 'member' && !!user;

  const value = useMemo<DiscordAuthContextValue>(() => ({
    user,
    role,
    isLoggedIn:             isDiscordLoggedIn() && !!user,
    isAdmin,
    canEditSchedule,
    isMember:               role === 'member' || role === 'admin',
    isVip:                  role === 'admin' || isVip,
    canAccessMemberContent: vipAccess,
    canAccessVipSchedule:   vipAccess,
    isGuestLoggedIn:        isDiscordLoggedIn() && role === 'guest',
    canChangeNickname,
    displayName:            user ? getDisplayName(user) : null,
    avatarUrl:              user ? discordAvatarUrl(user.discordId, user.avatar) : null,
    login,
    logout,
    refresh,
    updateNickname,
  }), [user, role, isAdmin, canEditSchedule, isVip, vipAccess, canChangeNickname, login, logout, refresh, updateNickname]);

  return (
    <DiscordAuthContext.Provider value={value}>
      {children}
    </DiscordAuthContext.Provider>
  );
}

export function useDiscordAuth(): DiscordAuthContextValue {
  const ctx = useContext(DiscordAuthContext);
  if (!ctx) throw new Error('useDiscordAuth must be used within DiscordAuthProvider');
  return ctx;
}
