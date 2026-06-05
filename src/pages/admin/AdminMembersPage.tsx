import { ConfirmModal } from '../../components/ConfirmModal';
import { AdminFeedbackBanner } from '../../components/admin/feedback/AdminFeedbackBanner';
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
        Discord <strong>@사용자명</strong> 또는 <strong>표시 이름</strong>으로 회원을 등록합니다.
        로그인 열 <strong>대기</strong>는 아직 Discord로 한 번도 로그인하지 않은 상태입니다 (정상).
        Discord ID를 알면 함께 입력해 두면 바로 <strong>완료</strong>로 표시됩니다.
      </p>

      <div className="admin-withdraw-callout">
        <h3 className="admin-withdraw-callout-title">동호회 탈퇴</h3>
        <p className="admin-withdraw-callout-text">
          나간 회원은 <strong>로그인함</strong> 탭에서 찾아 <strong>탈퇴</strong>하세요.
          명단·후기·포인트가 모두 삭제됩니다.
        </p>
      </div>

      <MemberAddForm
        newUsername={m.newUsername}
        newNickname={m.newNickname}
        newDiscordId={m.newDiscordId}
        newIsVip={m.newIsVip}
        saving={m.saving}
        hasRemote={m.hasRemote()}
        onUsernameChange={m.setNewUsername}
        onNicknameChange={m.setNewNickname}
        onDiscordIdChange={m.setNewDiscordId}
        onIsVipChange={m.setNewIsVip}
        onAdd={() => void m.handleAdd()}
      />

      <AdminFeedbackBanner
        warn={!m.hasRemote() ? '지금은 명단을 저장할 수 없습니다. 사이트 운영 담당자에게 문의해 주세요.' : null}
        feedback={m.feedback}
      />

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
