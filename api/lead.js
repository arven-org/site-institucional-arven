/**
 * Recebe o lead do site e reencaminha para o webhook (ex.: N8N).
 * Configure LEAD_WEBHOOK_URL no projeto Vercel (Settings → Environment Variables).
 */
const REQUIRED = ["nome", "email", "whatsapp", "empresa", "segmento", "faturamento", "midia", "desafio"];

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise(function (resolve, reject) {
    var chunks = [];
    var total = 0;
    var max = 256 * 1024;
    req.on("data", function (c) {
      total += c.length;
      if (total > max) {
        req.destroy();
        reject(new Error("payload_too_large"));
        return;
      }
      chunks.push(c);
    });
    req.on("end", function () {
      var buf = Buffer.concat(chunks);
      resolve(buf.toString("utf8"));
    });
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return json(res, 405, { error: "method_not_allowed" });
  }

  var target = process.env.LEAD_WEBHOOK_URL;
  if (!target || !/^https?:\/\//i.test(target)) {
    return json(res, 503, { error: "webhook_not_configured" });
  }

  var body;
  try {
    var raw = await readBody(req);
    body = JSON.parse(raw || "{}");
  } catch (e) {
    if (e && e.message === "payload_too_large") {
      return json(res, 413, { error: "payload_too_large" });
    }
    return json(res, 400, { error: "invalid_json" });
  }

  if (body._honeypot && String(body._honeypot).trim() !== "") {
    return json(res, 400, { error: "bad_request" });
  }

  if (!body.lead || typeof body.lead !== "object") {
    return json(res, 400, { error: "missing_lead" });
  }

  for (var i = 0; i < REQUIRED.length; i++) {
    var k = REQUIRED[i];
    var v = body.lead[k];
    if (v == null || String(v).trim() === "") {
      return json(res, 400, { error: "missing_field", field: k });
    }
  }

  var email = String(body.lead.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { error: "invalid_email" });
  }

  var wa = String(body.lead.whatsapp || "").replace(/\D/g, "");
  if (wa.length < 10 || wa.length > 13) {
    return json(res, 400, { error: "invalid_whatsapp" });
  }

  var outbound = {
    event: "lead_qualificacao",
    receivedAt: new Date().toISOString(),
    source: body.source || "arven_site",
    page: body.page || null,
    referrer: body.referrer || null,
    campaign: body.campaign && typeof body.campaign === "object" ? body.campaign : {},
    lead: body.lead,
  };

  var headers = { "Content-Type": "application/json" };
  var secret = process.env.LEAD_WEBHOOK_SECRET;
  if (secret) {
    headers.Authorization = "Bearer " + secret;
  }

  try {
    var r = await fetch(target, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(outbound),
    });
    if (!r.ok) {
      return json(res, 502, { error: "webhook_upstream_error", status: r.status });
    }
  } catch (e) {
    return json(res, 502, { error: "webhook_unreachable" });
  }

  return json(res, 200, { ok: true });
};
