import type { Connect } from 'vite';
import { handleAuthRoute } from './handlers';

export function authApiMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url ?? '';
    if (!url.startsWith('/api/auth/')) {
      next();
      return;
    }
    void handleAuthRoute(req, res, url.split('?')[0]).then(handled => {
      if (!handled) next();
    });
  };
}
