import { useEffect } from 'react';
import type { HomePageTab } from './types';

interface UseHomePageEffectsArgs {
  page:                  HomePageTab;
  canEditSchedule:       boolean;
  isEditMode:            boolean;
  toggleEditMode:        () => void;
  refreshReviews:        () => Promise<void>;
}

export function useHomePageEffects({
  page,
  canEditSchedule,
  isEditMode,
  toggleEditMode,
  refreshReviews,
}: UseHomePageEffectsArgs): void {
  useEffect(() => {
    if (!canEditSchedule && isEditMode) toggleEditMode();
  }, [canEditSchedule, isEditMode, toggleEditMode]);

  useEffect(() => {
    if (page === 'community') void refreshReviews();
  }, [page, refreshReviews]);
}
