import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Pencil } from 'lucide-react';
import { useDiscordAuth } from '../context/DiscordAuthContext';
import { NicknameChangeModal } from './NicknameChangeModal';

export function ProfileMenu() {
  const {
    displayName, avatarUrl, logout, updateNickname, canChangeNickname, user,
  } = useDiscordAuth();

  const [open, setOpen]           = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  if (!user) return null;

  return (
    <>
      <div className="profile-menu-wrap" ref={wrapRef}>
        <button
          type="button"
          className="profile-menu-trigger"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          {avatarUrl && <img src={avatarUrl} alt="" className="hd-discord-avatar" />}
          <span className="hd-user">{displayName}</span>
          <ChevronDown size={14} className={`profile-menu-chevron${open ? ' open' : ''}`} />
        </button>

        {open && (
          <div className="profile-menu-dropdown" role="menu">
            {canChangeNickname && (
              <button
                type="button"
                className="profile-menu-item"
                role="menuitem"
                onClick={() => { setOpen(false); setModalOpen(true); }}
              >
                <Pencil size={15} /> 닉네임 변경
              </button>
            )}
            <button
              type="button"
              className="profile-menu-item profile-menu-item-danger"
              role="menuitem"
              onClick={() => { setOpen(false); logout(); }}
            >
              <LogOut size={15} /> 로그아웃
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <NicknameChangeModal
          currentNickname={displayName ?? user.username}
          onSave={updateNickname}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
