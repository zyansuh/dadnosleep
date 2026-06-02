import React from 'react';

interface Props {
  label:    string;
  error?:   string;
  children: React.ReactNode;
}

export function Field({ label, error, children }: Props) {
  return (
    <div className="ff">
      <label className="fl">
        {label} <span className="req">*</span>
      </label>
      {children}
      {error && <span className="fe">{error}</span>}
    </div>
  );
}
