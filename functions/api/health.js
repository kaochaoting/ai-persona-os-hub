// Hub site health check endpoint
// GET /api/health → { status, timestamp, uptime, version, kv_status, r2_status? }
// CORS enabled for cross-origin monitoring

export async function onRequest(context) {
  const { request, env } = context;
  const startTime = Date.now();

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const checks = {};

  // 1. KV backend
  try {
    // KV list 是最輕量的讀取測試
    const kvTest = await env.FEED_KV.list({ limit: 1 });
    checks.kv = { status: 'ok', latency_ms: Date.now() - startTime };
  } catch (err) {
    checks.kv = { status: 'error', detail: err.message };
  }

  // 2. Response time
  const totalMs = Date.now() - startTime;

  // 3. Compute version info from git if available
  let version = 'unknown';
  try {
    // Cloudflare Pages Functions can't access filesystem, so version is static
    version = '1.0.0';
  } catch (_) {}

  const health = {
    status: checks.kv.status === 'ok' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    response_time_ms: totalMs,
    version,
    checks,
  };

  const httpStatus = health.status === 'ok' ? 200 : 503;

  return new Response(JSON.stringify(health, null, 2), {
    status: httpStatus,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      ...corsHeaders,
    },
  });
}
