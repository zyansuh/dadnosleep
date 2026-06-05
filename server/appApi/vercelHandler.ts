import type { VercelRequest, VercelResponse } from '@vercel/node';
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

export async function dispatchAppApi(
  req: VercelRequest,
  res: VercelResponse,
  segments: string[],
): Promise<boolean> {
  if (segments[0] === 'schedule') {
    if (segments[1] === 'published' && req.method === 'GET') {
      await handleSchedulePublished(req, res);
      return true;
    }
    if (segments[1] === 'draft' && req.method === 'GET') {
      await handleScheduleDraft(req, res);
      return true;
    }
    if (segments[1] === 'draft' && req.method === 'PUT') {
      await handleScheduleSaveDraft(req, res);
      return true;
    }
    if (segments[1] === 'publish' && req.method === 'POST') {
      await handleSchedulePublish(req, res);
      return true;
    }
    if (segments[1] === 'unpublish' && req.method === 'POST') {
      await handleScheduleUnpublish(req, res);
      return true;
    }
  }

  if (segments[0] === 'suggestions') {
    if (!segments[1] && req.method === 'GET') {
      await handleSuggestionsList(req, res);
      return true;
    }
    if (!segments[1] && req.method === 'POST') {
      await handleSuggestionCreate(req, res);
      return true;
    }
    if (segments[1] && req.method === 'GET') {
      await handleSuggestionGet(req, res, decodeURIComponent(segments[1]));
      return true;
    }
    if (segments[1] && req.method === 'PATCH') {
      await handleSuggestionStatus(req, res, decodeURIComponent(segments[1]));
      return true;
    }
  }

  return false;
}
