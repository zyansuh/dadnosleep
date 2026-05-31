import React from 'react';
import { X, Send } from 'lucide-react';
import type { SuggForm } from '../types';
import { Field } from './Field';

const CATEGORIES = ['드라마', '예능', '영화', '애니', '다큐', '기타'] as const;

interface Props {
  form:         SuggForm;
  setForm:      React.Dispatch<React.SetStateAction<SuggForm>>;
  errors:       Partial<SuggForm>;
  submitted:    boolean;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  validate:     () => boolean;
  onClose:      () => void;
}

export function SuggestionModal({
  form, setForm, errors, submitted, setSubmitted, validate, onClose,
}: Props) {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setSubmitted(true);
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        {/* 헤더 */}
        <div className="modal-hd">
          <div className="modal-title-row">
            <div className="modal-ico"><Send size={15} /></div>
            <div>
              <h3>편성표 건의하기</h3>
              <p>원하는 프로그램을 알려주세요 🎤</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {!submitted ? (
          <form className="modal-form" onSubmit={handleSubmit}>
            <Field label="프로그램명" error={errors.title}>
              <input
                className={`inp ${errors.title ? 'inp-err' : ''}`}
                placeholder="원하는 프로그램명"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </Field>

            <Field label="카테고리" error={errors.category}>
              <div className="cat-grid">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`cat-btn ${form.category === c ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, category: c }))}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="희망 시간대" error={errors.time}>
              <input
                className={`inp ${errors.time ? 'inp-err' : ''}`}
                placeholder="예: 매주 금요일 밤 11시"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              />
            </Field>

            <Field label="건의 내용" error={errors.desc}>
              <textarea
                className={`inp inp-ta ${errors.desc ? 'inp-err' : ''}`}
                rows={3}
                placeholder="어떤 프로그램인지 설명해주세요"
                value={form.desc}
                onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              />
            </Field>

            <Field label="닉네임" error={errors.nick}>
              <input
                className={`inp ${errors.nick ? 'inp-err' : ''}`}
                placeholder="닉네임"
                value={form.nick}
                onChange={e => setForm(f => ({ ...f, nick: e.target.value }))}
              />
            </Field>

            <div className="form-actions">
              <button type="button" className="btn-ghost-sm" onClick={onClose}>
                취소
              </button>
              <button type="submit" className="btn-coral-form">
                <Send size={14} /> 제출하기
              </button>
            </div>
          </form>
        ) : (
          <div className="success-box">
            <div className="success-emoji">🎉</div>
            <h3>건의가 접수됐어요!</h3>
            <p>소중한 의견 감사합니다.<br />검토 후 편성에 반영하겠습니다.</p>
            <div className="summary">
              {([['프로그램', form.title], ['카테고리', form.category], ['시간대', form.time]] as const).map(
                ([k, v]) => (
                  <div key={k} className="sum-row">
                    <span className="sk">{k}</span>
                    <span className="sv">{v}</span>
                  </div>
                )
              )}
            </div>
            <button className="btn-coral-form" onClick={onClose}>확인</button>
          </div>
        )}
      </div>
    </div>
  );
}
