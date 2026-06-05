import { isAdminDiscordUsername } from '../constants/adminUsers';
import { signDiscordAdminToken } from '../admin/discordAdminJwt';
import { readJsonBody, type ApiRequest } from '../appApi/readJsonBody';
import { sendJson, type ApiResponse } from '../appApi/jsonResponse';
import { exchangeDiscordCode } from './oauth';

export async function handleDiscordCallback(
  req: ApiRequest,
  res: ApiResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readJsonBody<{ code?: string }>(req);
    const code = body.code;
    if (!code || typeof code !== 'string') {
      sendJson(res, 400, { error: 'Missing code' });
      return;
    }

    const user = await exchangeDiscordCode(code);
    let adminToken: string | undefined;
    if (isAdminDiscordUsername(user.username)) {
      adminToken = await signDiscordAdminToken(user.id, user.username);
    }

    sendJson(res, 200, {
      id:          user.id,
      username:    user.username,
      global_name: user.global_name,
      avatar:      user.avatar,
      adminToken,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Discord OAuth failed';
    console.error('[discord-callback]', message);
    sendJson(res, 500, { error: message });
  }
}
