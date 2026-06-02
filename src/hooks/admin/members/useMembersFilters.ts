import { useMemo, useState } from 'react';
import type { MemberListFilter } from '../../../utils/members/memberListMessages';
import { filterMembersByLink } from '../../../utils/members/membersStore';
import type { MemberEntry } from '../../../types/member';

export function useMembersFilters(members: MemberEntry[]) {
  const [listFilter, setListFilter] = useState<MemberListFilter>('linked');

  const filterCounts = useMemo(() => ({
    all:     members.length,
    linked:  members.filter(m => Boolean(m.discordId?.trim())).length,
    pending: members.filter(m => !m.discordId?.trim()).length,
    vip:     members.filter(m => m.isVip).length,
  }), [members]);

  const filteredMembers = useMemo(
    () => filterMembersByLink(members, listFilter),
    [members, listFilter],
  );

  return { listFilter, setListFilter, filterCounts, filteredMembers };
}
