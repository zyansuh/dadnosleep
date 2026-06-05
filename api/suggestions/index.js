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

// server/suggestion/publicHandlers.ts
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
async function handleSuggestionsList(_req, res) {
  try {
    const record = await fetchServerBinRecord();
    const list = normalizeList(record.suggestions);
    sendJson(res, 200, { ok: true, suggestions: list });
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : "\uAC74\uC758\uD568\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."
    });
  }
}
async function handleSuggestionCreate(req, res) {
  try {
    const body = await readJsonBody(req);
    const title = body.title?.trim() ?? "";
    const category = body.category?.trim() ?? "";
    const time = body.time?.trim() ?? "";
    const desc = body.desc?.trim() ?? "";
    const nick = body.nick?.trim() ?? "";
    if (!title || !category || !time || !desc || !nick) {
      sendJson(res, 400, { error: "\uD544\uC218 \uD56D\uBAA9\uC744 \uBAA8\uB450 \uC785\uB825\uD574 \uC8FC\uC138\uC694." });
      return;
    }
    const record = await fetchServerBinRecord();
    const list = normalizeList(record.suggestions);
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      category,
      time,
      desc,
      nick,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "pending",
      replies: []
    };
    await patchServerBinRecord({ suggestions: [item, ...list] });
    sendJson(res, 201, { ok: true, suggestion: item });
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : "\uAC74\uC758 \uB4F1\uB85D\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4."
    });
  }
}

// scripts/api-route-sources/suggestions/index.ts
async function handler(req, res) {
  if (req.method === "GET") {
    await handleSuggestionsList(req, res);
    return;
  }
  if (req.method === "POST") {
    await handleSuggestionCreate(req, res);
    return;
  }
  return res.status(405).json({ error: "Method not allowed" });
}
export {
  handler as default
};
