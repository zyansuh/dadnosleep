import type { LucideIcon } from 'lucide-react';
import { Coins, RotateCcw, Trash2, UserPlus } from 'lucide-react';

export type AdminResetKind = 'points' | 'reviews' | 'invites' | 'all';

export interface AdminResetActionConfig {
  kind:           AdminResetKind;
  label:          string;
  hint:           string;
  buttonClass:    string;
  icon:           LucideIcon;
  modalTitle:     string;
  modalMessage:   string;
  confirmLabel:   string;
  successMessage: string;
}

export const ADMIN_RESET_ACTIONS: AdminResetActionConfig[] = [
  {
    kind:           'points',
    label:          '포인트만 초기화',
    hint:           '후기·지인 초대 글은 그대로 두고, 포인트 랭킹만 0으로 맞춥니다. 새 후기·초대 시 다시 집계됩니다.',
    buttonClass:    'admin-reset-points-btn',
    icon:           Coins,
    modalTitle:     '포인트만 초기화',
    modalMessage:   '모든 후기·지인 초대 신고는 유지하고, 포인트 랭킹만 0으로 초기화합니다. 계속할까요?',
    confirmLabel:   '포인트 초기화',
    successMessage: '포인트 랭킹을 초기화했습니다. 후기와 지인 초대 신고는 그대로입니다.',
  },
  {
    kind:           'reviews',
    label:          '후기만 초기화',
    hint:           '후기만 삭제합니다. 지인 초대 신고·초대 포인트는 유지됩니다.',
    buttonClass:    'admin-reset-reviews-btn',
    icon:           RotateCcw,
    modalTitle:     '후기만 초기화',
    modalMessage:   '모든 후기를 삭제합니다. 지인 초대 신고는 삭제하지 않습니다. 계속할까요?',
    confirmLabel:   '초기화',
    successMessage: '후기만 삭제했습니다. 지인 초대 신고와 초대 포인트는 유지됩니다.',
  },
  {
    kind:           'invites',
    label:          '지인 초대만 초기화',
    hint:           '지인 초대 신고만 삭제합니다. 후기·후기 포인트는 유지됩니다.',
    buttonClass:    'admin-reset-invite-btn',
    icon:           UserPlus,
    modalTitle:     '지인 초대만 초기화',
    modalMessage:   '지인 초대 신고 기록을 모두 삭제합니다. 후기는 삭제하지 않습니다. 계속할까요?',
    confirmLabel:   '초기화',
    successMessage: '지인 초대 신고만 삭제했습니다. 후기와 후기 포인트는 유지됩니다.',
  },
  {
    kind:           'all',
    label:          '전체 초기화',
    hint:           '후기·지인 초대·포인트 랭킹을 전부 비웁니다. 되돌릴 수 없습니다.',
    buttonClass:    'admin-reset-all-btn',
    icon:           Trash2,
    modalTitle:     '전체 초기화',
    modalMessage:   '후기, 지인 초대 신고, 포인트 랭킹을 모두 삭제합니다. 되돌릴 수 없습니다. 계속할까요?',
    confirmLabel:   '전체 삭제',
    successMessage: '후기·지인 초대·포인트를 모두 삭제했습니다.',
  },
];
