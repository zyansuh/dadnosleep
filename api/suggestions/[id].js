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

// server/admin/discordAdminJwt.ts
import { SignJWT, jwtVerify } from "jose";
function secretKey() {
  const secret = process.env.JWT_SECRET ?? process.env.VITE_JWT_SECRET ?? "dadnosleep-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
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
  const discord = await verifyDiscordAdminToken(token);
  if (discord) {
    return { ok: true, kind: "discord_admin", username: discord.username };
  }
  return { ok: false, status: 403, message: "\uAD00\uB9AC\uC790 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. Discord \uAD00\uB9AC\uC790 \uACC4\uC815\uC73C\uB85C \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694." };
}

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

// server/suggestion/handlers.ts
var VALID_STATUS = /* @__PURE__ */ new Set(["pending", "reviewing", "answered", "closed"]);
function normalizeList(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item) => {
    if (!item || typeof item !== "object") return false;
    const o = item;
    return typeof o.id === "string" && typeof o.title === "string" && typeof o.nick === "string" && typeof o.createdAt === "string";
  }).map((item) => ({
    ...item,
    status: VALID_STATUS.has(item.status) ? item.status : "pending"
  }));
}
async function handleSuggestionGet(_req, res, id) {
  try {
    const record = await fetchServerBinRecord();
    const list = normalizeList(record.suggestions);
    const item = list.find((s) => s.id === id);
    if (!item) {
      sendJson(res, 404, { error: "\uAC74\uC758\uC0AC\uD56D\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." });
      return;
    }
    sendJson(res, 200, { ok: true, suggestion: item });
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : "\uAC74\uC758\uC0AC\uD56D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."
    });
  }
}
async function handleSuggestionStatus(req, res, id) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    sendJson(res, auth.status, { error: auth.message });
    return;
  }
  try {
    const body = await readJsonBody(req);
    const status = body.status;
    if (!status || !VALID_STATUS.has(status)) {
      sendJson(res, 400, { error: "\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uCC98\uB9AC \uC0C1\uD0DC\uC785\uB2C8\uB2E4." });
      return;
    }
    const record = await fetchServerBinRecord();
    const list = normalizeList(record.suggestions);
    const idx = list.findIndex((s) => s.id === id);
    if (idx < 0) {
      sendJson(res, 404, { error: "\uAC74\uC758\uC0AC\uD56D\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." });
      return;
    }
    list[idx] = { ...list[idx], status };
    await patchServerBinRecord({ suggestions: list });
    sendJson(res, 200, { ok: true, suggestion: list[idx] });
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : "\uC0C1\uD0DC \uBCC0\uACBD\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4."
    });
  }
}

// scripts/api-route-sources/suggestions/[id].ts
async function handler(req, res) {
  const id = typeof req.query.id === "string" ? req.query.id : "";
  if (!id) {
    return res.status(400).json({ error: "id\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4." });
  }
  if (req.method === "GET") {
    await handleSuggestionGet(req, res, decodeURIComponent(id));
    return;
  }
  if (req.method === "PATCH") {
    await handleSuggestionStatus(req, res, decodeURIComponent(id));
    return;
  }
  return res.status(405).json({ error: "Method not allowed" });
}
export {
  handler as default
};
