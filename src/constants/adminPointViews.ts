import type { PointPeriodView } from '../utils/community/pointPeriod';

export const ADMIN_POINT_VIEWS: {
  id:    PointPeriodView;
  label: string;
  desc:  string;
}[] = [
  { id: 'total',  label: '합산',       desc: '후기 + 지인 초대' },
  { id: 'review', label: '후기',       desc: '1,500P / 건' },
  { id: 'invite', label: '지인 초대',  desc: '2,000P / 건' },
];
