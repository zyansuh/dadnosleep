import { ArrowLeft } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export function CommunityPageHeader({ onBack }: Props) {
  return (
    <div className="comm-page-header">
      <button type="button" className="btn-back" onClick={onBack}>
        <ArrowLeft size={18} /> 돌아가기
      </button>
      <div className="comm-page-heading">
        <h2 className="comm-page-title">💬 커뮤니티</h2>
        <p className="comm-page-sub">모든 회원·방문자의 후기를 이곳에서 볼 수 있어요.</p>
      </div>
    </div>
  );
}
