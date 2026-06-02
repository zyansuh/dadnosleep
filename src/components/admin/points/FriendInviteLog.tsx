import type { FriendInvite } from '../../../types/community';
import { POINTS_PER_FRIEND_INVITE } from '../../../constants/points';
import {
  displayInviteeNickname,
  formatInviteDateTime,
} from '../../../utils/community/friendInvite';

interface Props {
  invites:  FriendInvite[];
  loading:  boolean;
  rangeLabel: string;
}

export function FriendInviteLog({ invites, loading, rangeLabel }: Props) {
  return (
    <section className="ap-invite-log" aria-labelledby="ap-invite-log-title">
      <header className="ap-invite-log-hd">
        <h3 id="ap-invite-log-title" className="ap-invite-log-title">📋 지인 초대 신고 내역</h3>
        <p className="ap-invite-log-hint">
          {rangeLabel} · 신고 시각 순 · 1건당 {POINTS_PER_FRIEND_INVITE.toLocaleString()}P (신고자 기준)
        </p>
      </header>

      {loading ? (
        <p className="ap-invite-log-empty">불러오는 중…</p>
      ) : invites.length === 0 ? (
        <p className="ap-invite-log-empty">선택한 기간에 지인 초대 신고가 없습니다.</p>
      ) : (
        <>
          <div className="ap-invite-log-table-wrap ap-invite-log-table-wrap--desktop">
            <table className="admin-table ap-invite-log-table">
              <thead>
                <tr>
                  <th>신고 시각</th>
                  <th>내 닉네임 (포인트 대상)</th>
                  <th>초대한 지인</th>
                </tr>
              </thead>
              <tbody>
                {invites.map(inv => (
                  <tr key={inv.id}>
                    <td className="ap-invite-log-time">{formatInviteDateTime(inv.createdAt)}</td>
                    <td><strong>{inv.nickname}</strong></td>
                    <td>
                      {inv.inviteeNickname ? (
                        <strong className="ap-invite-log-invitee">{inv.inviteeNickname}</strong>
                      ) : (
                        <span className="ap-invite-log-missing" title="이전 형식 신고">미기재</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="ap-invite-log-mobile" aria-label="지인 초대 신고 목록">
            {invites.map(inv => (
              <li key={inv.id} className="ap-invite-log-card">
                <time className="ap-invite-log-time" dateTime={inv.createdAt}>
                  {formatInviteDateTime(inv.createdAt)}
                </time>
                <div className="ap-invite-log-pair">
                  <div className="ap-invite-log-row">
                    <span className="ap-invite-log-label">내 닉네임</span>
                    <strong>{inv.nickname}</strong>
                  </div>
                  <span className="ap-invite-log-arrow" aria-hidden>→</span>
                  <div className="ap-invite-log-row">
                    <span className="ap-invite-log-label">초대한 지인</span>
                    <strong className="ap-invite-log-invitee">
                      {displayInviteeNickname(inv)}
                    </strong>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
