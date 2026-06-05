import type { Connect } from 'vite';
import { handleDiscordCallback } from './callbackHandler';

export function discordApiMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url ?? '';
    if (url.split('?')[0] !== '/api/discord-callback') {
      next();
      return;
    }

    void handleDiscordCallback(req, res);
  };
}
