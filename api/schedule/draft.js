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

// server/schedule/handlers.ts
function parseScheduleField(raw) {
  if (!raw || typeof raw !== "object") return {};
  return raw;
}
function isValidSnapshot(s) {
  if (!s || typeof s !== "object") return false;
  const o = s;
  return typeof o.week === "string" && Array.isArray(o.data) && Array.isArray(o.memberRow);
}
async function handleScheduleDraft(req, res) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    sendJson(res, auth.status, { error: auth.message });
    return;
  }
  try {
    const record = await fetchServerBinRecord();
    const schedule = parseScheduleField(record.schedule);
    sendJson(res, 200, {
      ok: true,
      draft: isValidSnapshot(schedule.draft) ? schedule.draft : null,
      published: isValidSnapshot(schedule.published) ? schedule.published : null,
      isPublished: schedule.isPublished === true,
      publishedAt: schedule.publishedAt ?? null
    });
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : "\uD3B8\uC131\uD45C\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."
    });
  }
}
async function handleScheduleSaveDraft(req, res) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    sendJson(res, auth.status, { error: auth.message });
    return;
  }
  try {
    const body = await readJsonBody(req);
    if (!isValidSnapshot(body.draft)) {
      sendJson(res, 400, { error: "\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uD3B8\uC131\uD45C \uB370\uC774\uD130\uC785\uB2C8\uB2E4." });
      return;
    }
    const record = await fetchServerBinRecord();
    const prev = parseScheduleField(record.schedule);
    const schedule = {
      ...prev,
      draft: body.draft
    };
    await patchServerBinRecord({ schedule });
    sendJson(res, 200, { ok: true });
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : "\uD3B8\uC131\uD45C \uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4."
    });
  }
}

// scripts/api-route-sources/schedule/draft.ts
async function handler(req, res) {
  if (req.method === "GET") {
    await handleScheduleDraft(req, res);
    return;
  }
  if (req.method === "PUT") {
    await handleScheduleSaveDraft(req, res);
    return;
  }
  return res.status(405).json({ error: "Method not allowed" });
}
export {
  handler as default
};
