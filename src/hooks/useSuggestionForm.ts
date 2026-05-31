import { useState } from 'react';
import type { SuggForm } from '../types';

const EMPTY_FORM: SuggForm = { title: '', category: '', time: '', desc: '', nick: '' };

interface UseSuggestionFormReturn {
  form:       SuggForm;
  setForm:    React.Dispatch<React.SetStateAction<SuggForm>>;
  errors:     Partial<SuggForm>;
  modalOpen:  boolean;
  submitted:  boolean;
  openModal:  () => void;
  closeModal: () => void;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  validate:   () => boolean;
}

export function useSuggestionForm(): UseSuggestionFormReturn {
  const [form,      setForm]      = useState<SuggForm>(EMPTY_FORM);
  const [errors,    setErrors]    = useState<Partial<SuggForm>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const openModal = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(false);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const validate = (): boolean => {
    const e: Partial<SuggForm> = {};
    if (!form.title.trim())    e.title    = '프로그램명을 입력해주세요';
    if (!form.category)        e.category = '카테고리를 선택해주세요';
    if (!form.time.trim())     e.time     = '시간대를 입력해주세요';
    if (!form.desc.trim())     e.desc     = '내용을 입력해주세요';
    if (!form.nick.trim())     e.nick     = '닉네임을 입력해주세요';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return { form, setForm, errors, modalOpen, submitted, openModal, closeModal, setSubmitted, validate };
}
