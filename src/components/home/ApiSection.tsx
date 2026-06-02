
import { Sparkles } from 'lucide-react';
import type { ApiType, OttItem, YtItem } from '../../types';
import { ApiCard } from '../ApiCard';
import { fmtViews } from '../../utils/format';

interface Props {
  activeApi:          ApiType | null;
  ottItems:           OttItem[];
  ytItems:            YtItem[];
  ottLoading:         boolean;
  ottError:           string;
  randing:            boolean;
  handleApiCard:      (type: ApiType) => Promise<void>;
  onOpenOttDrawer:    () => void;
  onOpenRandomDrawer: () => void;
}

export function ApiSection({
  activeApi, ottItems, ytItems, ottLoading, ottError, randing,
  handleApiCard, onOpenOttDrawer, onOpenRandomDrawer,
}: Props) {
  return (
    <section className="api-section" id="추천">
      <div className="sec-wrap">
        <div className="api-layout">
          <div className="api-desc-panel">
            <div className="api-eyebrow">
              <Sparkles size={14} /> 데이터로 더 똑똑하게
            </div>
            <h2 className="api-title">API 기반 추천 엔진</h2>
            <p className="api-desc-text">
              넷플릭스 TOP 10과 통합 인기 데이터를 실시간으로 분석하여 최적의 편성표를 생성합니다.
            </p>
          </div>

          <ApiCard
            icon={<span className="n-icon">N</span>}
            title="넷플릭스 TOP 10"
            desc={<>국내 넷플릭스 TOP 10<br />실시간 연동</>}
            btnLabel="TOP 10 보기 →"
            active={activeApi === 'netflix'}
            onClick={() => handleApiCard('netflix')}
            cls="card-netflix"
          />

          <ApiCard
            icon={
              <span className="api-icon-multi">
                <span>N</span><span>D+</span>
                <span>T</span><span>W</span>
              </span>
            }
            title="OTT 통합 인기작"
            desc={<>넷플릭스, 디즈니+, 티빙, wavve<br />통합 인기 랭킹</>}
            btnLabel="인기작 보기 →"
            active={false}
            onClick={onOpenOttDrawer}
            cls="card-ott"
          />

          <ApiCard
            icon={<span className="dice">🎲</span>}
            title="랜덤 편성 생성"
            desc={<>취향·장르·시간대 기반<br />스마트 랜덤 추천</>}
            btnLabel={randing ? '생성 중…' : '랜덤 생성하기 →'}
            active={false}
            onClick={onOpenRandomDrawer}
            cls="card-random"
          />

          <ApiCard
            icon={<span className="yt-card-icon">▶</span>}
            title="유튜브 인기 영상"
            desc={<>국내 유튜브 실시간 인기<br />TOP 12 영상 추천</>}
            btnLabel="유튜브 보기 →"
            active={activeApi === 'youtube'}
            onClick={() => handleApiCard('youtube')}
            cls="card-yt"
          />
        </div>

        {activeApi && (
          <div className="ott-result-box">
            <h4>
              {activeApi === 'netflix' && '넷플릭스 TOP 10'}
              {activeApi === 'youtube' && '유튜브 인기 영상 TOP 12'}
            </h4>

            {ottLoading && <p className="result-msg">불러오는 중…</p>}
            {ottError   && <p className="result-msg err">⚠️ {ottError}</p>}

            {!ottLoading && !ottError && ottItems.length > 0 && (
              <div className="ott-grid">
                {ottItems.map((item, i) => (
                  <a
                    key={item.id}
                    href={`https://www.themoviedb.org/${item.media_type ?? (item.title ? 'movie' : 'tv')}/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ott-card"
                  >
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                        alt={item.title || item.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="ott-no-poster">🎬</div>
                    )}
                    <span className="ott-rank">#{i + 1}</span>
                    <span className="ott-name">{item.title || item.name}</span>
                  </a>
                ))}
              </div>
            )}

            {!ottLoading && !ottError && ytItems.length > 0 && (
              <div className="yt-grid">
                {ytItems.map(v => {
                  const thumb   = v.snippet?.thumbnails?.medium?.url;
                  const title   = v.snippet?.title   ?? '';
                  const channel = v.snippet?.channelTitle ?? '';
                  const views   = fmtViews(v.statistics?.viewCount);
                  return (
                    <a
                      key={v.id}
                      href={`https://www.youtube.com/watch?v=${v.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="yt-card"
                    >
                      <div className="yt-thumb-wrap">
                        {thumb
                          ? <img src={thumb} alt={title} loading="lazy" />
                          : <div className="yt-no-thumb">▶</div>
                        }
                        <span className="yt-play">▶</span>
                      </div>
                      <div className="yt-info">
                        <p className="yt-title">{title}</p>
                        <p className="yt-ch">{channel}</p>
                        {views && <p className="yt-views">{views}</p>}
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
