var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/admin/discordAdminJwt.ts
var discordAdminJwt_exports = {};
__export(discordAdminJwt_exports, {
  signDiscordAdminToken: () => signDiscordAdminToken,
  verifyDiscordAdminToken: () => verifyDiscordAdminToken
});
import { SignJWT, jwtVerify } from "jose";
function secretKey() {
  const secret = process.env.JWT_SECRET ?? process.env.VITE_JWT_SECRET ?? "dadnosleep-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}
async function signDiscordAdminToken(discordId, username) {
  return new SignJWT({ kind: "discord_admin", username, discordId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(EXPIRY).sign(secretKey());
}
async function verifyDiscordAdminToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.kind !== "discord_admin") return null;
    if (!payload.username || !payload.discordId) return null;
    return {
      kind: "discord_admin",
      username: String(payload.username),
      discordId: String(payload.discordId)
    };
  } catch {
    return null;
  }
}
var EXPIRY;
var init_discordAdminJwt = __esm({
  "server/admin/discordAdminJwt.ts"() {
    EXPIRY = "12h";
  }
});

// server/jsonbin/config.ts
function getServerJsonBinAccessKey() {
  const raw = process.env.JSONBIN_ACCESS_KEY ?? process.env.VITE_JSONBIN_ACCESS_KEY ?? "";
  return raw.replace(/^["']|["']$/g, "").trim();
}
function getServerCommunityBinId() {
  return (process.env.JSONBIN_BIN_ID ?? process.env.VITE_JSONBIN_BIN_ID ?? "").trim();
}

// server/jsonbin/record.ts
function classifyStatus(status) {
  if (status === 401) return "\uC800\uC7A5\uC18C \uC811\uADFC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.";
  if (status === 404) return "\uC800\uC7A5\uC18C\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.";
  return "\uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.";
}
async function fetchServerBinRecord() {
  const key = getServerJsonBinAccessKey();
  const binId = getServerCommunityBinId();
  if (!key || !binId) throw new Error("JSONBin\uC774 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");
  const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    headers: { "X-Access-Key": key }
  });
  if (!res.ok) throw new Error(classifyStatus(res.status));
  const json = await res.json();
  return json.record ?? {};
}
async function putServerBinRecord(record) {
  const key = getServerJsonBinAccessKey();
  const binId = getServerCommunityBinId();
  if (!key || !binId) throw new Error("JSONBin\uC774 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");
  const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Key": key
    },
    body: JSON.stringify(record)
  });
  if (!res.ok) throw new Error(classifyStatus(res.status));
}
async function patchServerBinRecord(patch) {
  const existing = await fetchServerBinRecord();
  const next = { ...existing, ...patch };
  await putServerBinRecord(next);
  return next;
}

// server/admin/verifyRequest.ts
function getBearer(req) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice(7).trim();
}
async function verifyAdminRequest(req) {
  const token = getBearer(req);
  if (!token) {
    return { ok: false, status: 401, message: "\uAD00\uB9AC\uC790 \uC778\uC99D\uC774 \uD544\uC694\uD569\uB2C8\uB2E4. Discord \uAD00\uB9AC\uC790\uB85C \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694." };
  }
  const { verifyDiscordAdminToken: verifyDiscordAdminToken2 } = await Promise.resolve().then(() => (init_discordAdminJwt(), discordAdminJwt_exports));
  const discord = await verifyDiscordAdminToken2(token);
  if (discord) {
    return { ok: true, kind: "discord_admin", username: discord.username };
  }
  return { ok: false, status: 403, message: "\uAD00\uB9AC\uC790 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. Discord \uAD00\uB9AC\uC790 \uACC4\uC815\uC73C\uB85C \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694." };
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

// server/schedule/scheduleParse.ts
function parseScheduleField(raw) {
  if (!raw || typeof raw !== "object") return {};
  return raw;
}

// server/schedule/handlers.ts
async function handleScheduleUnpublish(req, res) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    sendJson(res, auth.status, { error: auth.message });
    return;
  }
  try {
    const record = await fetchServerBinRecord();
    const prev = parseScheduleField(record.schedule);
    const schedule = {
      ...prev,
      isPublished: false,
      published: null,
      publishedAt: null
    };
    await patchServerBinRecord({ schedule });
    sendJson(res, 200, { ok: true });
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : "\uD3B8\uC131\uD45C \uBE44\uACF5\uAC1C \uCC98\uB9AC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4."
    });
  }
}

// scripts/api-route-sources/schedule/unpublish.ts
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  await handleScheduleUnpublish(req, res);
}
export default handler;
