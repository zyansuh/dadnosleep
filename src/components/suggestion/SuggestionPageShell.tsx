import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface Props {
  title:     string;
  subtitle?: string;
  action?:   ReactNode;
  children:  ReactNode;
}

export function SuggestionPageShell({ title, subtitle, action, children }: Props) {
  return (
    <div className="app">
      <div className="sugg-page">
        <header className="sugg-page-hd">
          <Link to="/" className="btn-back">
            <ArrowLeft size={18} /> 사이트로
          </Link>
          <div className="sugg-page-title-wrap">
            <h1>{title}</h1>
            {subtitle && <p className="sugg-page-sub">{subtitle}</p>}
          </div>
          {action && <div className="sugg-page-action">{action}</div>}
        </header>
        <main className="sugg-page-main">{children}</main>
      </div>
    </div>
  );
}
