import { ConfirmModal } from '../../components/ConfirmModal';
import { MemberAddForm } from '../../components/admin/members/MemberAddForm';
import { MemberListToolbar } from '../../components/admin/members/MemberListToolbar';
import { MemberTable } from '../../components/admin/members/MemberTable';
import { useAdminMembers } from '../../hooks/admin/useAdminMembers';
import { displayMemberNickname } from '../../utils/members/memberDisplay';

export function AdminMembersPage() {
  const m = useAdminMembers();

  return (
    <div className="admin-page-body admin-page-body--members">
      <h2 className="admin-panel-title">회원 명단 관리</h2>
      <p className="admin-page-desc admin-page-desc--compact">
        Discord <strong>@이름</strong> 또는 <strong>표시 이름</strong>으로 회원을 등록합니다.
        <strong>VIP</strong> 회원만 회원 전용 편성을 볼 수 있고, 후기·랭킹에 왕관이 표시됩니다.
      </p>

      <div className="admin-withdraw-callout">
        <h3 className="admin-withdraw-callout-title">동호회 탈퇴</h3>
        <p className="admin-withdraw-callout-text">
          나간 회원은 <strong>로그인함</strong> 탭에서 찾아 <strong>탈퇴</strong>하세요.
          명단·후기·포인트가 모두 삭제됩니다.
        </p>
      </div>

      {!m.hasRemote() && (
        <p className="admin-alert admin-alert-warn">
          지금은 명단을 저장할 수 없습니다. 사이트 운영 담당자에게 문의해 주세요.
        </p>
      )}

      <MemberAddForm
        newUsername={m.newUsername}
        newNickname={m.newNickname}
        newIsVip={m.newIsVip}
        saving={m.saving}
        hasRemote={m.hasRemote()}
        onUsernameChange={m.setNewUsername}
        onNicknameChange={m.setNewNickname}
        onIsVipChange={m.setNewIsVip}
        onAdd={() => void m.handleAdd()}
      />

      {m.error && <p className="admin-alert admin-alert-error">{m.error}</p>}
      {m.success && <p className="admin-alert admin-alert-ok">{m.success}</p>}

      <MemberListToolbar
        filter={m.listFilter}
        counts={m.filterCounts}
        onChange={m.setListFilter}
      />

      <MemberTable
        members={m.filteredMembers}
        loading={m.loading}
        saving={m.saving}
        editingKey={m.editingKey}
        editNickname={m.editNickname}
        listFilter={m.listFilter}
        onEditNicknameChange={m.setEditNickname}
        onStartEdit={m.startEdit}
        onCancelEdit={m.cancelEdit}
        onSaveEdit={m.saveEdit}
        onWithdraw={m.setWithdrawTarget}
        onToggleVip={m.toggleVip}
      />

      {m.withdrawTarget && (
        <ConfirmModal
          title="회원 탈퇴 처리"
          message={
            `@${m.withdrawTarget.username} (${displayMemberNickname(m.withdrawTarget)}) 님을 동호회 명단에서 탈퇴 처리할까요?\n\n` +
            '· 회원 명단에서 삭제됩니다.\n' +
            '· 해당 닉네임(@username·표시 이름·사이트 닉)의 후기·지인 초대·포인트가 모두 삭제됩니다.\n' +
            '· 다시 로그인하면 일반 방문자이며 VIP 편성 수정이 불가합니다.'
          }
          confirmLabel="탈퇴 처리"
          danger
          closeOnConfirm={false}
          onConfirm={() => void m.confirmWithdraw()}
          onClose={() => !m.saving && m.setWithdrawTarget(null)}
        />
      )}
    </div>
  );
}
