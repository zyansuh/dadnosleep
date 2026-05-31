import React from 'react';
import type { Cell } from '../types';
import { DAYS, TIMES } from '../constants/schedule';
import { slotStatus } from '../utils/scheduleTime';
import { CellInner } from './CellInner';

interface Props {
  sched:    Cell[][];
  todayIdx: number;
  nowMin:   number;
}

export function ScheduleTable({ sched, todayIdx, nowMin }: Props) {
  return (
    <div className="sched-card">
      <div className="sched-head">
        <h3>이번 주 편성표 (20:00 ~ 02:00)</h3>
        <span className="sched-op">20:00 ~ 02:00 운영</span>
      </div>
      <div className="sched-note">
        ① 편성표는 매일 업데이트되며, 실시간으로 달라질 수 있어요.
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
                    isToday ? 'cell-today' : '',
                    isLive  ? 'cell-live'  : '',
                  ].filter(Boolean).join(' ');

                  return (
                    <td key={di} className={cellCls}>
                      {cell.link ? (
                        <a
                          href={cell.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cell-inner"
                        >
                          <CellInner cell={cell} isLive={isLive} />
                        </a>
                      ) : (
                        <div className="cell-inner">
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
