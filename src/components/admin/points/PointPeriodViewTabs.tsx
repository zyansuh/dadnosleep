import { PenLine, UserPlus, Layers } from 'lucide-react';
import { ADMIN_POINT_VIEWS } from '../../../constants/adminPointViews';
import type { PointPeriodView } from '../../../utils/community/pointPeriod';

const ICONS = {
  total:  Layers,
  review: PenLine,
  invite: UserPlus,
} as const;

interface Props {
  view:     PointPeriodView;
  onChange: (v: PointPeriodView) => void;
}

export function PointPeriodViewTabs({ view, onChange }: Props) {
  return (
    <div className="ap-view-tabs" role="tablist" aria-label="포인트 종류">
      {ADMIN_POINT_VIEWS.map(tab => {
        const Icon = ICONS[tab.id];
        const active = view === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`ap-view-tab ap-view-tab--${tab.id}${active ? ' is-active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            <span className="ap-view-tab-ico"><Icon size={18} /></span>
            <span className="ap-view-tab-text">
              <span className="ap-view-tab-label">{tab.label}</span>
              <span className="ap-view-tab-desc">{tab.desc}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
