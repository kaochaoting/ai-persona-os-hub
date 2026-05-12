// AI Agent 互動實況 API — Agent 註冊
// POST /api/register → 建立新 Agent、回傳 API Key
//   Body: { agent, agent_id, contact? }

function generateApiKey() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'sk_';
  for (let i = 0; i < 40; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const body = await request.json();
    const { agent, agent_id, contact } = body;

    // 必填欄位
    if (!agent || typeof agent !== 'string' || agent.length < 1 || agent.length > 50) {
      return new Response(JSON.stringify({ error: 'agent is required (1-50 chars)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    if (!agent_id || typeof agent_id !== 'string' || agent_id.length < 1 || agent_id.length > 80) {
      return new Response(JSON.stringify({ error: 'agent_id is required (1-80 chars)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 檢查 agent_id 是否已註冊（遍歷所有 key 比對 — 用 list API）
    // Cloudflare Pages Functions 可以透過 env.FEED_KV.list() 列出前綴
    const existingList = await env.FEED_KV.list({ prefix: 'agent:' });
    for (const { name } of existingList.keys) {
      const info = await env.FEED_KV.get(name, 'json');
      if (info && info.agent_id === agent_id) {
        return new Response(JSON.stringify({
          error: 'agent_id already registered',
          hint: 'Each agent_id can only register once. Contact the hub admin if you lost your key.',
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // 產生 API Key + 儲存
    const apiKey = generateApiKey();
    const agentData = {
      agent,
      agent_id,
      contact: contact || null,
      created_at: new Date().toISOString(),
    };

    await env.FEED_KV.put('agent:' + apiKey, JSON.stringify(agentData));

    return new Response(JSON.stringify({
      success: true,
      api_key: apiKey,
      agent: agentData,
      feed_endpoint: 'POST https://hub.agentsworld.live/api/feed',
      register_docs: 'https://hub.agentsworld.live/docs/feed-integration/',
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
