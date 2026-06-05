// server/appApi/jsonResponse.ts
function isVercelResponse(res) {
  return typeof res.status === "function" && typeof res.json === "function";
}
function sendJson(res, status, data) {
  if (isVercelResponse(res)) {
    res.status(status).json(data);
    return;
  }
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

// server/auth/usersStore.ts
import path from "node:path";
var DEV_FILE = path.join(process.cwd(), "data", "users.json");

// server/auth/password.ts
import bcrypt from "bcryptjs";

// server/auth/jwt.ts
import { SignJWT, jwtVerify } from "jose";
function secretKey() {
  const secret = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET || "dadnosleep-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}
async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.id || !payload.email || !payload.role) return null;
    return {
      id: String(payload.id),
      email: String(payload.email),
      role: payload.role
    };
  } catch {
    return null;
  }
}

// server/auth/handlers.ts
function getBearer(req) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice(7);
}
async function handleMe(req, res) {
  const token = getBearer(req);
  if (!token) {
    sendJson(res, 401, { error: "\uC778\uC99D\uC774 \uD544\uC694\uD569\uB2C8\uB2E4." });
    return;
  }
  const payload = await verifyToken(token);
  if (!payload) {
    sendJson(res, 401, { error: "\uD1A0\uD070\uC774 \uB9CC\uB8CC\uB418\uC5C8\uAC70\uB098 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." });
    return;
  }
  sendJson(res, 200, { user: payload });
}

// scripts/api-route-sources/auth/me.ts
function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  return handleMe(req, res);
}
export {
  handler as default
};
