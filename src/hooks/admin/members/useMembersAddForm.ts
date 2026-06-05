import { useState } from 'react';

export function useMembersAddForm() {
  const [newUsername, setNewUsername]   = useState('');
  const [newNickname, setNewNickname]   = useState('');
  const [newDiscordId, setNewDiscordId] = useState('');
  const [newIsVip, setNewIsVip]         = useState(false);

  const resetForm = () => {
    setNewUsername('');
    setNewNickname('');
    setNewDiscordId('');
    setNewIsVip(false);
  };

  return {
    newUsername,
    setNewUsername,
    newNickname,
    setNewNickname,
    newDiscordId,
    setNewDiscordId,
    newIsVip,
    setNewIsVip,
    resetForm,
  };
}
