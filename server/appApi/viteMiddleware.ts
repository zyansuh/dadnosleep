import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect } from 'vite';
import {
  handleScheduleDraft,
  handleSchedulePublished,
  handleSchedulePublish,
  handleScheduleSaveDraft,
  handleScheduleUnpublish,
} from '../schedule/handlers';
import {
  handleSuggestionCreate,
  handleSuggestionGet,
  handleSuggestionStatus,
  handleSuggestionsList,
} from '../suggestion/handlers';

async function routeAppApi(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
): Promise<boolean> {
  if (pathname === '/api/schedule/published' && req.method === 'GET') {
    await handleSchedulePublished(req, res);
    return true;
  }
  if (pathname === '/api/schedule/draft' && req.method === 'GET') {
    await handleScheduleDraft(req, res);
    return true;
  }
  if (pathname === '/api/schedule/draft' && req.method === 'PUT') {
    await handleScheduleSaveDraft(req, res);
    return true;
  }
  if (pathname === '/api/schedule/publish' && req.method === 'POST') {
    await handleSchedulePublish(req, res);
    return true;
  }
  if (pathname === '/api/schedule/unpublish' && req.method === 'POST') {
    await handleScheduleUnpublish(req, res);
    return true;
  }

  if (pathname === '/api/suggestions' && req.method === 'GET') {
    await handleSuggestionsList(req, res);
    return true;
  }
  if (pathname === '/api/suggestions' && req.method === 'POST') {
    await handleSuggestionCreate(req, res);
    return true;
  }

  const suggestionMatch = pathname.match(/^\/api\/suggestions\/([^/]+)$/);
  if (suggestionMatch) {
    const id = decodeURIComponent(suggestionMatch[1]);
    if (req.method === 'GET') {
      await handleSuggestionGet(req, res, id);
      return true;
    }
    if (req.method === 'PATCH') {
      await handleSuggestionStatus(req, res, id);
      return true;
    }
  }

  return false;
}

export function appApiMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url ?? '';
    if (!url.startsWith('/api/')) {
      next();
      return;
    }
    const pathname = url.split('?')[0];
    void routeAppApi(req as IncomingMessage, res as ServerResponse, pathname).then(handled => {
      if (!handled) next();
    });
  };
}
