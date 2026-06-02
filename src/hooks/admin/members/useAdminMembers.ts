import { useCallback } from 'react';
import { hasMembersRemote } from '../../../utils/members/membersStore';
import { displayMemberNickname } from '../../../utils/members/memberDisplay';
import { useAdminFeedback } from '../useAdminFeedback';
import { useMembersAddForm } from './useMembersAddForm';
import { useMembersEdit } from './useMembersEdit';
import { useMembersFilters } from './useMembersFilters';
import { useMembersListQuery } from './useMembersListQuery';
import { useMembersMutations } from './useMembersMutations';

export function useAdminMembers() {
  const { feedback, clear, showOk, showError } = useAdminFeedback();
  const feedbackApi = { clear, showOk, showError };

  const list = useMembersListQuery({ clear, showError });
  const filters = useMembersFilters(list.members);
  const form = useMembersAddForm();
  const mutations = useMembersMutations(feedbackApi, list.members, list.setMembers);
  const edit = useMembersEdit(feedbackApi, list.setMembers, mutations.setSaving);

  const handleAdd = useCallback(() => {
    void mutations.handleAdd({
      newUsername: form.newUsername,
      newNickname: form.newNickname,
      newIsVip:    form.newIsVip,
      resetForm:   form.resetForm,
    });
  }, [mutations, form]);

  return {
    members:              list.members,
    filteredMembers:      filters.filteredMembers,
    listFilter:           filters.listFilter,
    setListFilter:        filters.setListFilter,
    filterCounts:         filters.filterCounts,
    loading:              list.loading,
    reload:               list.reload,
    saving:               mutations.saving,
    newUsername:          form.newUsername,
    setNewUsername:       form.setNewUsername,
    newNickname:          form.newNickname,
    setNewNickname:       form.setNewNickname,
    newIsVip:             form.newIsVip,
    setNewIsVip:          form.setNewIsVip,
    feedback,
    editingKey:           edit.editingKey,
    editNickname:         edit.editNickname,
    setEditNickname:      edit.setEditNickname,
    withdrawTarget:       mutations.withdrawTarget,
    setWithdrawTarget:    mutations.setWithdrawTarget,
    hasRemote:            hasMembersRemote,
    handleAdd,
    toggleVip:            mutations.toggleVip,
    startEdit:            edit.startEdit,
    cancelEdit:           edit.cancelEdit,
    saveEdit:             edit.saveEdit,
    confirmWithdraw:      mutations.confirmWithdraw,
    displayMemberNickname,
  };
}
