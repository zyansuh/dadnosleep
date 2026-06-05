import { useState, useCallback } from 'react';
import type { SuggForm } from '../../types/suggestion';
import type { SavedSuggestion } from '../../types/suggestion';
import { createSuggestion, fetchSuggestions } from '../../utils/suggestion/suggestionApi';

const EMPTY_FORM: SuggForm = { title: '', category: '', time: '', desc: '', nick: '' };

interface UseSuggestionFormReturn {
  form:         SuggForm;
  setForm:      React.Dispatch<React.SetStateAction<SuggForm>>;
  errors:       Partial<SuggForm>;
  modalOpen:    boolean;
  submitted:    boolean;
  suggestions:  SavedSuggestion[];
  loading:      boolean;
  submitError:  string;
  openModal:    () => void;
  closeModal:   () => void;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  validate:     () => Promise<boolean>;
  refresh:      () => Promise<void>;
}

export function useSuggestionForm(): UseSuggestionFormReturn {
  const [form,        setForm]        = useState<SuggForm>(EMPTY_FORM);
  const [errors,      setErrors]      = useState<Partial<SuggForm>>({});
  const [modalOpen,   setModalOpen]   = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [suggestions, setSuggestions] = useState<SavedSuggestion[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [submitError, setSubmitError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchSuggestions();
      setSuggestions(list);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const openModal = useCallback(() => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(false);
    setSubmitError('');
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const validate = useCallback(async (): Promise<boolean> => {
    const e: Partial<SuggForm> = {};
    if (!form.title.trim())     e.title    = '프로그램명을 입력해주세요';
    if (!form.category)         e.category = '카테고리를 선택해주세요';
    if (!form.time.trim())      e.time     = '시간대를 입력해주세요';
    if (!form.desc.trim())      e.desc     = '내용을 입력해주세요';
    if (!form.nick.trim())      e.nick     = '닉네임을 입력해주세요';
    setErrors(e);

    if (Object.keys(e).length > 0) return false;

    setSubmitError('');
    try {
      const item = await createSuggestion(form);
      setSuggestions(prev => [item, ...prev]);
      return true;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '건의 등록에 실패했습니다.');
      return false;
    }
  }, [form]);

  return {
    form, setForm, errors, modalOpen, submitted, suggestions,
    loading, submitError, openModal, closeModal, setSubmitted, validate, refresh,
  };
}

export type { SavedSuggestion };
