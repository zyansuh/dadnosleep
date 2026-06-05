import { Plus } from 'lucide-react';
import type { useSuggestionForm } from '../../../hooks/useSuggestionForm';
import { SuggestionModal } from '../../SuggestionModal';

type Suggest = ReturnType<typeof useSuggestionForm>;

interface Props {
  suggest: Suggest;
}

export function HomeSuggestionOverlays({ suggest }: Props) {
  return (
    <>
      <button className="fab" onClick={suggest.openModal} aria-label="프로그램 건의하기">
        <Plus size={18} /><span>건의</span>
      </button>

      {suggest.modalOpen && (
        <SuggestionModal
          form={suggest.form}
          setForm={suggest.setForm}
          errors={suggest.errors}
          submitted={suggest.submitted}
          setSubmitted={suggest.setSubmitted}
          validate={suggest.validate}
          submitError={suggest.submitError}
          onClose={suggest.closeModal}
        />
      )}
    </>
  );
}
