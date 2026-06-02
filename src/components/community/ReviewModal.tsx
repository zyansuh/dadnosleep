import { X, Send, Star } from 'lucide-react';
import type { Review } from '../../types/community';
import { POINTS_PER_REVIEW } from '../../constants/points';
import { useReviewForm } from '../../hooks/community/useReviewForm';

interface Props {
  onSubmit: (draft: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  onClose:  () => void;
}

export function ReviewModal({ onSubmit, onClose }: Props) {
  const { form, setForm, errors, done, saving, saveErr, submit } = useReviewForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit(onSubmit);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && !saving && onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <div className="modal-title-row">
            <div className="modal-ico">✍️</div>
            <div>
              <h3>후기 작성</h3>
              <p>작성 완료 시 <strong style={{ color: '#ffd57a' }}>{POINTS_PER_REVIEW.toLocaleString()}P</strong> 즉시 지급!</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} disabled={saving}><X size={18} /></button>
        </div>

        {!done ? (
          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="ff">
              <label className="fl">닉네임 <span className="req">*</span></label>
              <input className={`inp ${errors.nickname ? 'inp-err' : ''}`}
                placeholder="닉네임" value={form.nickname}
                onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))} />
              {errors.nickname && <span className="fe">{errors.nickname}</span>}
            </div>

            <div className="ff">
              <label className="fl">어떤 프로그램을 봤나요? <span className="req">*</span></label>
              <input className={`inp ${errors.programTitle ? 'inp-err' : ''}`}
                placeholder="ex) 나는 솔로, 이혼숙려캠프…" value={form.programTitle}
                onChange={e => setForm(f => ({ ...f, programTitle: e.target.value }))} />
              {errors.programTitle && <span className="fe">{errors.programTitle}</span>}
            </div>

            <div className="ff">
              <label className="fl">별점</label>
              <div className="rv-star-row">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button"
                    className={`rv-star-btn ${n <= form.rating ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, rating: n }))}>
                    <Star size={22} fill={n <= form.rating ? '#ffd57a' : 'none'} color={n <= form.rating ? '#ffd57a' : '#5a5a72'} />
                  </button>
                ))}
                <span className="rv-rating-text">{form.rating}.0</span>
              </div>
            </div>

            <div className="ff">
              <label className="fl">후기 내용 <span className="req">*</span></label>
              <textarea className={`inp inp-ta ${errors.content ? 'inp-err' : ''}`} rows={4}
                placeholder="어떤 점이 좋았나요? 솔직하게 작성해주세요!"
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
              {errors.content && <span className="fe">{errors.content}</span>}
            </div>

            {saveErr && <p className="fe" style={{ textAlign: 'center' }}>{saveErr}</p>}

            <div className="form-actions">
              <button type="button" className="btn-ghost-sm" onClick={onClose} disabled={saving}>취소</button>
              <button type="submit" className="btn-coral-form" disabled={saving}>
                <Send size={14} /> {saving ? '저장 중…' : '후기 등록하기'}
              </button>
            </div>
          </form>
        ) : (
          <div className="success-box">
            <div className="success-emoji">🎉</div>
            <h3>후기가 등록됐어요!</h3>
            <p><strong style={{ color: '#ffd57a' }}>{POINTS_PER_REVIEW.toLocaleString()} 포인트</strong>가 지급됐습니다.</p>
            <div className="summary" style={{ marginTop: 8 }}>
              <div className="sum-row"><span className="sk">닉네임</span><span className="sv">{form.nickname}</span></div>
              <div className="sum-row"><span className="sk">프로그램</span><span className="sv">{form.programTitle}</span></div>
              <div className="sum-row"><span className="sk">별점</span><span className="sv">{'⭐'.repeat(form.rating)}</span></div>
            </div>
            <button
              className="btn-coral-form"
              style={{ flex: 'none', width: '100%', marginTop: 8 }}
              onClick={onClose}
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
