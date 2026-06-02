import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadUsers, saveUsers, isAdminEmail } from './usersStore';
import { hashPassword, verifyPassword } from './password';
import { signToken, verifyToken } from './jwt';
import type { PublicUser, StoredUser } from './types';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', c => chunks.push(c as Buffer));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function getBearer(req: IncomingMessage): string | null {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return null;
  return h.slice(7);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function toPublic(user: StoredUser): PublicUser {
  return { id: user.id, email: user.email, role: user.role };
}

export async function handleRegister(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const body = JSON.parse(await readBody(req)) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() ?? '';
    const password = body.password ?? '';

    if (!validateEmail(email)) {
      sendJson(res, 400, { error: '올바른 이메일을 입력해주세요.' });
      return;
    }
    if (password.length < 6) {
      sendJson(res, 400, { error: '비밀번호는 6자 이상이어야 합니다.' });
      return;
    }

    const users = await loadUsers();
    if (users.some(u => u.email === email)) {
      sendJson(res, 409, { error: '이미 가입된 이메일입니다.' });
      return;
    }

    const role = isAdminEmail(email) ? 'admin' : 'user';
    const newUser: StoredUser = {
      id:           `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      email,
      role,
      passwordHash: await hashPassword(password),
      createdAt:    new Date().toISOString(),
    };

    users.push(newUser);
    await saveUsers(users);

    const publicUser = toPublic(newUser);
    const token = await signToken(publicUser);
    sendJson(res, 201, { user: publicUser, token });
  } catch {
    sendJson(res, 500, { error: '회원가입 처리 중 오류가 발생했습니다.' });
  }
}

export async function handleLogin(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const body = JSON.parse(await readBody(req)) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() ?? '';
    const password = body.password ?? '';

    const users = await loadUsers();
    const user = users.find(u => u.email === email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      sendJson(res, 401, { error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      return;
    }

    const publicUser = toPublic(user);
    const token = await signToken(publicUser);
    sendJson(res, 200, { user: publicUser, token });
  } catch {
    sendJson(res, 500, { error: '로그인 처리 중 오류가 발생했습니다.' });
  }
}

export async function handleMe(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const token = getBearer(req);
  if (!token) {
    sendJson(res, 401, { error: '인증이 필요합니다.' });
    return;
  }
  const payload = await verifyToken(token);
  if (!payload) {
    sendJson(res, 401, { error: '토큰이 만료되었거나 유효하지 않습니다.' });
    return;
  }
  sendJson(res, 200, { user: payload });
}

export async function handleAuthRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
): Promise<boolean> {
  if (!pathname.startsWith('/api/auth/')) return false;

  const action = pathname.replace('/api/auth/', '');

  if (action === 'register' && req.method === 'POST') {
    await handleRegister(req, res);
    return true;
  }
  if (action === 'login' && req.method === 'POST') {
    await handleLogin(req, res);
    return true;
  }
  if (action === 'me' && req.method === 'GET') {
    await handleMe(req, res);
    return true;
  }

  sendJson(res, 404, { error: 'Not found' });
  return true;
}
