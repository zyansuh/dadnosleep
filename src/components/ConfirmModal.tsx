import { X } from 'lucide-react';

interface Props {
  title:       string;
  message:     string;
  confirmLabel?: string;
  cancelLabel?:  string;
  danger?:     boolean;
  onConfirm:   () => void;
  onClose:     () => void;
}

export function ConfirmModal({
  title, message, confirmLabel = '확인', cancelLabel = '취소',
  danger = false, onConfirm, onClose,
}: Props) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal confirm-modal">
        <div className="modal-hd">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="닫기"><X size={18} /></button>
        </div>
        <p className="confirm-msg">{message}</p>
        <div className="form-actions">
          <button type="button" className="btn-ghost-sm" onClick={onClose}>{cancelLabel}</button>
          <button
            type="button"
            className={danger ? 'btn-danger-confirm' : 'btn-coral-form'}
            style={{ flex: 1 }}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
