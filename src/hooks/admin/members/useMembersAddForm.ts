import { useState } from 'react';

export function useMembersAddForm() {
  const [newUsername, setNewUsername] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newIsVip, setNewIsVip]         = useState(false);

  const resetForm = () => {
    setNewUsername('');
    setNewNickname('');
    setNewIsVip(false);
  };

  return {
    newUsername,
    setNewUsername,
    newNickname,
    setNewNickname,
    newIsVip,
    setNewIsVip,
    resetForm,
  };
}
