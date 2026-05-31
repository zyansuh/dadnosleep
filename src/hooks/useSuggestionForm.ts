import { useState, useCallback } from 'react';
import type { SuggForm } from '../types';

const LS_KEY          = 'dadnosleep-suggestions';
const LS_SAVED_AT_KEY = 'dadnosleep-suggestions-saved-at';

export interface SavedSuggestion extends SuggForm {
  id:        string;
  createdAt: string;
}

function isOlderThanOneMonth(isoDate: string): boolean {
  const saved       = new Date(isoDate);
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  return saved < oneMonthAgo;
}

function loadSuggestions(): SavedSuggestion[] {
  try {
    const savedAt = localStorage.getItem(LS_SAVED_AT_KEY);
    if (savedAt && isOlderThanOneMonth(savedAt)) {
      localStorage.removeItem(LS_KEY);
      localStorage.removeItem(LS_SAVED_AT_KEY);
      return [];
    }
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSuggestions(list: SavedSuggestion[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
    if (!localStorage.getItem(LS_SAVED_AT_KEY)) {
      localStorage.setItem(LS_SAVED_AT_KEY, new Date().toISOString());
    }
  } catch { /* 무시 */ }
}

const EMPTY_FORM: SuggForm = { title: '', category: '', time: '', desc: '', nick: '' };

interface UseSuggestionFormReturn {
  form:         SuggForm;
  setForm:      React.Dispatch<React.SetStateAction<SuggForm>>;
  errors:       Partial<SuggForm>;
  modalOpen:    boolean;
  submitted:    boolean;
  suggestions:  SavedSuggestion[];
  openModal:    () => void;
  closeModal:   () => void;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  validate:     () => boolean;
}

export function useSuggestionForm(): UseSuggestionFormReturn {
  const [form,        setForm]        = useState<SuggForm>(EMPTY_FORM);
  const [errors,      setErrors]      = useState<Partial<SuggForm>>({});
  const [modalOpen,   setModalOpen]   = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [suggestions, setSuggestions] = useState<SavedSuggestion[]>(loadSuggestions);

  const openModal  = useCallback(() => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(false);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const validate = useCallback((): boolean => {
    const e: Partial<SuggForm> = {};
    if (!form.title.trim())     e.title    = '프로그램명을 입력해주세요';
    if (!form.category)         e.category = '카테고리를 선택해주세요';
    if (!form.time.trim())      e.time     = '시간대를 입력해주세요';
    if (!form.desc.trim())      e.desc     = '내용을 입력해주세요';
    if (!form.nick.trim())      e.nick     = '닉네임을 입력해주세요';
    setErrors(e);

    if (Object.keys(e).length === 0) {
      // 제출 성공 시 localStorage에 저장
      const newItem: SavedSuggestion = {
        ...form,
        id:        `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
      };
      const updated = [newItem, ...suggestions];
      setSuggestions(updated);
      saveSuggestions(updated);
    }
    return Object.keys(e).length === 0;
  }, [form, suggestions]);

  return { form, setForm, errors, modalOpen, submitted, suggestions, openModal, closeModal, setSubmitted, validate };
}
