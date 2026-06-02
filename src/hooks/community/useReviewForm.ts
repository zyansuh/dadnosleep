import { useState, useCallback } from 'react';
import type { Review } from '../../types/community';

export interface ReviewFormState {
  nickname:     string;
  programTitle: string;
  rating:       number;
  content:      string;
}

const INITIAL: ReviewFormState = {
  nickname:     '',
  programTitle: '',
  rating:       5,
  content:      '',
};

export function useReviewForm() {
  const [form,    setForm]    = useState<ReviewFormState>(INITIAL);
  const [errors,  setErrors]  = useState<Partial<ReviewFormState>>({});
  const [done,    setDone]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saveErr, setSaveErr] = useState('');

  const validate = useCallback(() => {
    const e: Partial<ReviewFormState> = {};
    if (!form.nickname.trim())     e.nickname = '닉네임을 입력해주세요';
    if (!form.programTitle.trim()) e.programTitle = '프로그램명을 입력해주세요';
    if (!form.content.trim())      e.content = '후기 내용을 입력해주세요';
    setErrors(e);
    return !Object.keys(e).length;
  }, [form]);

  const submit = useCallback(async (
    onSubmit: (draft: Omit<Review, 'id' | 'createdAt'>) => Promise<void>,
  ) => {
    if (!validate() || saving) return false;
    setSaving(true);
    setSaveErr('');
    try {
      await onSubmit({
        nickname:     form.nickname.trim(),
        programTitle: form.programTitle.trim(),
        rating:       form.rating,
        content:      form.content.trim(),
      });
      setDone(true);
      return true;
    } catch {
      setSaveErr('저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [form, validate, saving]);

  const reset = useCallback(() => {
    setForm(INITIAL);
    setErrors({});
    setDone(false);
    setSaveErr('');
    setSaving(false);
  }, []);

  return {
    form, setForm, errors, done, saving, saveErr, validate, submit, reset,
  };
}
