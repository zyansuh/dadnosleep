import { useCallback, useState } from 'react';
import {
  publishScheduleRemote,
  unpublishScheduleRemote,
} from '../../utils/schedule/scheduleApi';

interface LoaderReload {
  reload: () => Promise<void>;
}

export function useSchedulePublish(canManage: boolean, loader: LoaderReload) {
  const [publishBusy, setPublishBusy] = useState(false);
  const [publishError, setPublishError] = useState('');

  const publishSchedule = useCallback(async () => {
    if (!canManage) return;
    setPublishBusy(true);
    setPublishError('');
    try {
      await publishScheduleRemote();
      await loader.reload();
    } catch (e) {
      setPublishError(e instanceof Error ? e.message : '공개에 실패했습니다.');
    } finally {
      setPublishBusy(false);
    }
  }, [canManage, loader]);

  const unpublishSchedule = useCallback(async () => {
    if (!canManage) return;
    setPublishBusy(true);
    setPublishError('');
    try {
      await unpublishScheduleRemote();
      await loader.reload();
    } catch (e) {
      setPublishError(e instanceof Error ? e.message : '비공개 처리에 실패했습니다.');
    } finally {
      setPublishBusy(false);
    }
  }, [canManage, loader]);

  return { publishBusy, publishError, publishSchedule, unpublishSchedule };
}
