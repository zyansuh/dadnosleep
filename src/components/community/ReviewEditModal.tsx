import { useState } from 'react';
import { X, Save, Star } from 'lucide-react';
import type { Review } from '../../types/community';

interface Props {
  review:   Review;
  onSave:   (patch: Partial<Pick<Review, 'programTitle' | 'rating' | 'content'>>) => Promise<void>;
  onClose:  () => void;
}

export function ReviewEditModal({ review, onSave, onClose }: Props) {
  const [programTitle, setProgramTitle] = useState(review.programTitle);
  const [rating,       setRating]       = useState(review.rating);
  const [content,      setContent]      = useState(review.content);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programTitle.trim() || !content.trim()) {
      setError('프로그램명과 내용을 입력해주세요');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        programTitle: programTitle.trim(),
        rating,
        content:      content.trim(),
      });
      onClose();
    } catch {
      setError('수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && !saving && onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <div className="modal-title-row">
            <div className="modal-ico">✏️</div>
            <div><h3>후기 수정</h3><p>{review.nickname}</p></div>
          </div>
          <button className="modal-close" onClick={onClose} disabled={saving}><X size={18} /></button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="ff">
            <label className="fl">프로그램명</label>
            <input className="inp" value={programTitle} onChange={e => setProgramTitle(e.target.value)} />
          </div>
          <div className="ff">
            <label className="fl">별점</label>
            <div className="rv-star-row">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" className={`rv-star-btn ${n <= rating ? 'active' : ''}`}
                  onClick={() => setRating(n)}>
                  <Star size={22} fill={n <= rating ? '#ffd57a' : 'none'} color={n <= rating ? '#ffd57a' : '#5a5a72'} />
                </button>
              ))}
            </div>
          </div>
          <div className="ff">
            <label className="fl">후기 내용</label>
            <textarea className="inp inp-ta" rows={4} value={content} onChange={e => setContent(e.target.value)} />
          </div>
          {error && <span className="fe">{error}</span>}
          <div className="form-actions">
            <button type="button" className="btn-ghost-sm" onClick={onClose} disabled={saving}>취소</button>
            <button type="submit" className="btn-coral-form" disabled={saving}>
              <Save size={14} /> {saving ? '저장 중…' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
