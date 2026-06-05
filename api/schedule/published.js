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

// server/admin/discordAdminJwt.ts
import { SignJWT, jwtVerify } from "jose";

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
async function handleSchedulePublished(_req, res) {
  try {
    const record = await fetchServerBinRecord();
    const schedule = parseScheduleField(record.schedule);
    if (!schedule.isPublished || !isValidSnapshot(schedule.published)) {
      sendJson(res, 200, { ok: true, published: false, data: null });
      return;
    }
    sendJson(res, 200, {
      ok: true,
      published: true,
      data: schedule.published,
      publishedAt: schedule.publishedAt ?? null
    });
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : "\uD3B8\uC131\uD45C\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."
    });
  }
}

// scripts/api-route-sources/schedule/published.ts
async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  await handleSchedulePublished(req, res);
}
export {
  handler as default
};
