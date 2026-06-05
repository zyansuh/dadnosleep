import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleAdminToken } from '../admin/handlers';
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

function toNodeReq(req: VercelRequest) {
  return req as unknown as import('node:http').IncomingMessage;
}

function toNodeRes(res: VercelResponse) {
  return res as unknown as import('node:http').ServerResponse;
}

export async function dispatchAppApi(
  req: VercelRequest,
  res: VercelResponse,
  segments: string[],
): Promise<boolean> {
  const nodeReq = toNodeReq(req);
  const nodeRes = toNodeRes(res);

  if (segments[0] === 'admin' && segments[1] === 'token' && req.method === 'POST') {
    await handleAdminToken(nodeReq, nodeRes);
    return true;
  }

  if (segments[0] === 'schedule') {
    if (segments[1] === 'published' && req.method === 'GET') {
      await handleSchedulePublished(nodeReq, nodeRes);
      return true;
    }
    if (segments[1] === 'draft' && req.method === 'GET') {
      await handleScheduleDraft(nodeReq, nodeRes);
      return true;
    }
    if (segments[1] === 'draft' && req.method === 'PUT') {
      await handleScheduleSaveDraft(nodeReq, nodeRes);
      return true;
    }
    if (segments[1] === 'publish' && req.method === 'POST') {
      await handleSchedulePublish(nodeReq, nodeRes);
      return true;
    }
    if (segments[1] === 'unpublish' && req.method === 'POST') {
      await handleScheduleUnpublish(nodeReq, nodeRes);
      return true;
    }
  }

  if (segments[0] === 'suggestions') {
    if (!segments[1] && req.method === 'GET') {
      await handleSuggestionsList(nodeReq, nodeRes);
      return true;
    }
    if (!segments[1] && req.method === 'POST') {
      await handleSuggestionCreate(nodeReq, nodeRes);
      return true;
    }
    if (segments[1] && req.method === 'GET') {
      await handleSuggestionGet(nodeReq, nodeRes, decodeURIComponent(segments[1]));
      return true;
    }
    if (segments[1] && req.method === 'PATCH') {
      await handleSuggestionStatus(nodeReq, nodeRes, decodeURIComponent(segments[1]));
      return true;
    }
  }

  return false;
}
