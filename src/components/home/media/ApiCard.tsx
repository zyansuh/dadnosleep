import React from 'react';

interface Props {
  icon:     React.ReactNode;
  title:    string;
  desc:     React.ReactNode;
  btnLabel: string;
  active:   boolean;
  onClick:  () => void;
  cls:      string;
}

export function ApiCard({ icon, title, desc, btnLabel, active, onClick, cls }: Props) {
  return (
    <div
      className={`api-card ${cls} ${active ? 'api-active' : ''}`}
      onClick={onClick}
    >
      <div className="api-icon">{icon}</div>
      <div className="api-body">
        <h4>{title}</h4>
        <p>{desc}</p>
        <button className="api-cta">{btnLabel}</button>
      </div>
    </div>
  );
}
