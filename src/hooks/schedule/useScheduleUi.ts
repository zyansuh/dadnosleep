import { useState, useCallback } from 'react';

export function useScheduleUi() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  return {
    isEditMode,
    resetConfirmOpen,
    toggleEditMode: useCallback(() => setIsEditMode(v => !v), []),
    openResetConfirm: useCallback(() => setResetConfirmOpen(true), []),
    closeResetConfirm: useCallback(() => setResetConfirmOpen(false), []),
  };
}
