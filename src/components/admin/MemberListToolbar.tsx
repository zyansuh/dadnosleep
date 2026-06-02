import type { MemberListFilter } from '../../utils/members/memberListMessages';

export type { MemberListFilter };

interface Props {
  filter:     MemberListFilter;
  counts:       { all: number; linked: number; pending: number };
  onChange:     (f: MemberListFilter) => void;
}

const LABELS: Record<MemberListFilter, string> = {
  all:     '전체',
  linked:  '로그인함',
  pending: '로그인 전',
};

export function MemberListToolbar({ filter, counts, onChange }: Props) {
  return (
    <div className="admin-member-toolbar" role="tablist" aria-label="회원 목록 필터">
      {(['all', 'linked', 'pending'] as const).map(key => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={filter === key}
          className={`admin-member-filter${filter === key ? ' is-active' : ''}`}
          onClick={() => onChange(key)}
        >
          {LABELS[key]}
          <span className="admin-member-filter-count">{counts[key]}</span>
        </button>
      ))}
    </div>
  );
}
