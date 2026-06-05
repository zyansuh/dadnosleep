// server/appApi/readJsonBody.ts
function readStreamBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}
async function readJsonBody(req) {
  const { body } = req;
  if (body !== void 0 && body !== null && body !== "") {
    if (typeof body === "string") return JSON.parse(body);
    return body;
  }
  const text = await readStreamBody(req);
  if (!text.trim()) throw new Error("Missing request body");
  return JSON.parse(text);
}

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
import fs from "node:fs";
import path from "node:path";
var DEV_FILE = path.join(process.cwd(), "data", "users.json");
function binConfig() {
  const binId = process.env.JSONBIN_USERS_BIN_ID || process.env.VITE_JSONBIN_USERS_BIN_ID;
  const binKey = process.env.JSONBIN_ACCESS_KEY || process.env.VITE_JSONBIN_ACCESS_KEY;
  return binId && binKey ? { binId, binKey } : null;
}
async function loadFromJsonBin() {
  const cfg = binConfig();
  if (!cfg) return null;
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${cfg.binId}/latest`, {
      headers: { "X-Access-Key": cfg.binKey }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json.record) ? json.record : [];
  } catch {
    return null;
  }
}
function loadFromFile() {
  try {
    if (!fs.existsSync(DEV_FILE)) return [];
    const raw = fs.readFileSync(DEV_FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
async function loadUsers() {
  const remote = await loadFromJsonBin();
  if (remote) return remote;
  return loadFromFile();
}

// server/auth/password.ts
import bcrypt from "bcryptjs";
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// server/auth/jwt.ts
import { SignJWT, jwtVerify } from "jose";
var EXPIRY = "7d";
function secretKey() {
  const secret = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET || "dadnosleep-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}
async function signToken(user) {
  return new SignJWT({ id: user.id, email: user.email, role: user.role }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(EXPIRY).sign(secretKey());
}

// server/auth/handlers.ts
function toPublic(user) {
  return { id: user.id, email: user.email, role: user.role };
}
async function handleLogin(req, res) {
  try {
    const body = await readJsonBody(req);
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const users = await loadUsers();
    const user = users.find((u) => u.email === email);
    if (!user || !await verifyPassword(password, user.passwordHash)) {
      sendJson(res, 401, { error: "\uC774\uBA54\uC77C \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." });
      return;
    }
    const publicUser = toPublic(user);
    const token = await signToken(publicUser);
    sendJson(res, 200, { user: publicUser, token });
  } catch {
    sendJson(res, 500, { error: "\uB85C\uADF8\uC778 \uCC98\uB9AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
}

// scripts/api-route-sources/auth/login.ts
function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  return handleLogin(req, res);
}
export default handler;
