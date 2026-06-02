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
} from '../utils/discordSession';
import { isAdminSession } from '../utils/adminSession';
import type { UserRole } from '../types/role';
import { canAccessMemberContent } from '../types/role';
import { updateMemberNickname } from '../utils/membersStore';

function buildDiscordAuthorizeUrl(): string {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID as string | undefined;
  const redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI as string | undefined;
  if (!clientId || !redirectUri) {
    throw new Error('VITE_DISCORD_CLIENT_ID 또는 VITE_DISCORD_REDIRECT_URI가 설정되지 않았습니다.');
  }
  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'identify',
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

interface DiscordAuthContextValue {
  user:                   DiscordSessionUser | null;
  role:                   UserRole;
  isLoggedIn:             boolean;
  isAdmin:                boolean;
  isMember:               boolean;
  canAccessMemberContent: boolean;
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
  const memberAccess = canAccessMemberContent(role) || passwordAdmin;
  const canChangeNickname = role === 'member' && !!user;

  const value = useMemo<DiscordAuthContextValue>(() => ({
    user,
    role,
    isLoggedIn:             isDiscordLoggedIn() && !!user,
    isAdmin,
    isMember:               role === 'member' || role === 'admin',
    canAccessMemberContent: memberAccess,
    isGuestLoggedIn:        isDiscordLoggedIn() && role === 'guest',
    canChangeNickname,
    displayName:            user ? getDisplayName(user) : null,
    avatarUrl:              user ? discordAvatarUrl(user.discordId, user.avatar) : null,
    login,
    logout,
    refresh,
    updateNickname,
  }), [user, role, isAdmin, memberAccess, canChangeNickname, login, logout, refresh, updateNickname]);

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
