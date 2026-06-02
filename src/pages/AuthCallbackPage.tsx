import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveDiscordSession } from '../utils/discordSession';
import { processDiscordLogin } from '../utils/processDiscordLogin';
import { useDiscordAuth } from '../context/DiscordAuthContext';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { refresh }    = useDiscordAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('인증 코드가 없습니다.');
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch('/api/discord-callback', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ code }),
        });

        const data = (await res.json()) as {
          id?: string;
          username?: string;
          global_name?: string | null;
          avatar?: string | null;
          error?: string;
        };

        if (!res.ok) {
          throw new Error(data.error ?? 'Discord 로그인에 실패했습니다.');
        }

        if (!data.id || !data.username) {
          throw new Error('사용자 정보를 받지 못했습니다.');
        }

        if (cancelled) return;

        const profile = {
          id:           data.id,
          username:     data.username,
          global_name:  data.global_name,
          avatar:       data.avatar,
        };

        const { role, nickname } = await processDiscordLogin(profile);
        saveDiscordSession(profile, role, nickname);
        refresh();
        navigate('/', { replace: true });
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '로그인 처리 중 오류가 발생했습니다.');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [searchParams, navigate, refresh]);

  if (error) {
    return (
      <div className="auth-callback-page">
        <p className="auth-callback-error">{error}</p>
        <button type="button" className="btn-discord-login" onClick={() => navigate('/', { replace: true })}>
          메인으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="auth-callback-page">
      <p>Discord 로그인 처리 중…</p>
    </div>
  );
}
