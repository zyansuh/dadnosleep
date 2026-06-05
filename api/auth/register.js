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
async function saveToJsonBin(users) {
  const cfg = binConfig();
  if (!cfg) return false;
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${cfg.binId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Key": cfg.binKey
      },
      body: JSON.stringify(users)
    });
    return res.ok;
  } catch {
    return false;
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
function saveToFile(users) {
  const dir = path.dirname(DEV_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DEV_FILE, JSON.stringify(users, null, 2), "utf-8");
}
async function loadUsers() {
  const remote = await loadFromJsonBin();
  if (remote) return remote;
  return loadFromFile();
}
async function saveUsers(users) {
  const saved = await saveToJsonBin(users);
  if (!saved) saveToFile(users);
}
function isAdminEmail(email) {
  const list = (process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.toLowerCase());
}

// server/auth/password.ts
import bcrypt from "bcryptjs";
var ROUNDS = 10;
async function hashPassword(password) {
  return bcrypt.hash(password, ROUNDS);
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
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function toPublic(user) {
  return { id: user.id, email: user.email, role: user.role };
}
async function handleRegister(req, res) {
  try {
    const body = await readJsonBody(req);
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    if (!validateEmail(email)) {
      sendJson(res, 400, { error: "\uC62C\uBC14\uB978 \uC774\uBA54\uC77C\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694." });
      return;
    }
    if (password.length < 6) {
      sendJson(res, 400, { error: "\uBE44\uBC00\uBC88\uD638\uB294 6\uC790 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4." });
      return;
    }
    const users = await loadUsers();
    if (users.some((u) => u.email === email)) {
      sendJson(res, 409, { error: "\uC774\uBBF8 \uAC00\uC785\uB41C \uC774\uBA54\uC77C\uC785\uB2C8\uB2E4." });
      return;
    }
    const role = isAdminEmail(email) ? "admin" : "user";
    const newUser = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      email,
      role,
      passwordHash: await hashPassword(password),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    users.push(newUser);
    await saveUsers(users);
    const publicUser = toPublic(newUser);
    const token = await signToken(publicUser);
    sendJson(res, 201, { user: publicUser, token });
  } catch {
    sendJson(res, 500, { error: "\uD68C\uC6D0\uAC00\uC785 \uCC98\uB9AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
}

// scripts/api-route-sources/auth/register.ts
function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  return handleRegister(req, res);
}
export default handler;
