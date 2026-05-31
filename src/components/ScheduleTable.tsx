
import type { Cell } from '../types';
import { DAYS, TIMES } from '../constants/schedule';
import { slotStatus } from '../utils/scheduleTime';
import { CellInner } from './CellInner';

interface Props {
  sched:      Cell[][];
  todayIdx:   number;
  nowMin:     number;
  isEditMode: boolean;
  onEditCell: (dayIdx: number, timeIdx: number) => void;
}

export function ScheduleTable({ sched, todayIdx, nowMin, isEditMode, onEditCell }: Props) {
  return (
    <div className="sched-card">
      <div className="sched-head">
        <h3>📅 이번 주 편성표 미리보기</h3>
        <span className="sched-op">20:00 ~ 02:00 운영</span>
      </div>
      <div className="table-scroll">
        <table className="sched-tbl">
          <thead>
            <tr>
              <th className="th-empty" />
              {DAYS.map((d, i) => (
                <th key={d} className={i === todayIdx ? 'th-today' : ''}>
                  {d}
                  {i === todayIdx && <span className="today-dot" />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIMES.map((t, ti) => (
              <tr key={t}>
                <td className="td-t">{t}</td>
                {sched.map((day, di) => {
                  const cell    = day[ti];
                  const isToday = di === todayIdx;
                  const status  = isToday ? slotStatus(ti, nowMin) : '';
                  const isLive  = status === 'live';

                  const cellCls = [
                    'td-cell',
                    `cell-${cell.type}`,
                    isToday     ? 'cell-today' : '',
                    isLive      ? 'cell-live'  : '',
                    isEditMode  ? 'cell-editable' : '',
                  ].filter(Boolean).join(' ');

                  const handleClick = isEditMode
                    ? () => onEditCell(di, ti)
                    : undefined;

                  return (
                    <td key={di} className={cellCls}>
                      {cell.link && !isEditMode ? (
                        <a
                          href={cell.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cell-inner"
                        >
                          <CellInner cell={cell} isLive={isLive} />
                        </a>
                      ) : (
                        <div
                          className="cell-inner"
                          onClick={handleClick}
                          role={isEditMode ? 'button' : undefined}
                          tabIndex={isEditMode ? 0 : undefined}
                        >
                          {isEditMode && (
                            <span className="cell-edit-icon">✏️</span>
                          )}
                          <CellInner cell={cell} isLive={isLive} />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className="td-t td-end">02:00</td>
              <td colSpan={7} className="td-end-label">— 방송 종료 —</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
