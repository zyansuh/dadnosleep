import { ADMIN_POINT_PERIOD_PRESETS } from '../../../constants/adminPointPresets';
import type { PeriodPreset } from '../../../utils/community/pointPeriod';

interface Props {
  preset:           PeriodPreset;
  customStart:      string;
  customEnd:        string;
  registeredOnly:   boolean;
  onPresetChange:   (p: PeriodPreset) => void;
  onCustomStart:    (v: string) => void;
  onCustomEnd:      (v: string) => void;
  onRegisteredOnly: (v: boolean) => void;
}

export function PointPeriodToolbar({
  preset, customStart, customEnd, registeredOnly,
  onPresetChange, onCustomStart, onCustomEnd, onRegisteredOnly,
}: Props) {
  return (
    <div className="ap-period">
      <div className="ap-period-presets">
        {ADMIN_POINT_PERIOD_PRESETS.map(p => (
          <button
            key={p.id}
            type="button"
            className={`ap-period-preset${preset === p.id ? ' is-active' : ''}`}
            onClick={() => onPresetChange(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="ap-period-custom">
          <label className="fl">
            시작일
            <input
              type="date"
              className="inp"
              value={customStart}
              onChange={e => onCustomStart(e.target.value)}
            />
          </label>
          <label className="fl">
            종료일
            <input
              type="date"
              className="inp"
              value={customEnd}
              onChange={e => onCustomEnd(e.target.value)}
            />
          </label>
        </div>
      )}

      <label className="ap-period-toggle">
        <input
          type="checkbox"
          checked={registeredOnly}
          onChange={e => onRegisteredOnly(e.target.checked)}
        />
        동호회 등록 회원만 보기 (활동 없으면 0P 표시)
      </label>
    </div>
  );
}
