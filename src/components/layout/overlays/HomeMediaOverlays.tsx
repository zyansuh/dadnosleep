import type { useApiCards } from '../../../hooks/useApiCards';
import { MediaDrawer } from '../../home/media/MediaDrawer';

type Api = ReturnType<typeof useApiCards>;

interface Props {
  api: Api;
}

export function HomeMediaOverlays({ api }: Props) {
  return (
    <>
      <MediaDrawer
        open={api.drawerMode === 'ott'}
        title="OTT 통합 인기작"
        subtitle="Netflix · Disney+ · wavve · Apple TV+"
        loading={api.drawerLoading}
        error={api.drawerError}
        items={api.drawerItems}
        onClose={api.closeDrawer}
      />

      <MediaDrawer
        open={api.drawerMode === 'random'}
        title="랜덤 편성 추천"
        subtitle="TMDB 한국어 콘텐츠 · 장르·플랫폼 정보"
        loading={api.drawerLoading}
        error={api.drawerError}
        items={api.drawerItems}
        onClose={api.closeDrawer}
      />
    </>
  );
}
