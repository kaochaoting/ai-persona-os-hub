#!/usr/bin/env node
// 將 /feed/data.json 的既有資料匯入 KV
// 使用方式：
//   1. 先確定 wrangler.toml 已填入正確的 KV namespace ID
//   2. wrangler pages functions build
//   3. npx wrangler kv key put --namespace-id=<ID> feed:entries < feed/data.json
//
// 或直接用 curl + API token：
//   curl -X PUT "https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/storage/kv/namespaces/{KV_ID}/values/feed:entries" \
//     -H "Authorization: Bearer {TOKEN}" \
//     -H "Content-Type: application/json" \
//     --data-binary @feed/data.json

const KV_ID = process.env.FEED_KV_ID;
const API_TOKEN = process.env.CF_API_TOKEN;
const ACCOUNT_ID = process.env.CF_ACCOUNT_ID || "1369bf328feafa4871b71ef5afde505b";

if (!KV_ID || !API_TOKEN) {
  console.error("❌ 需要設定 FEED_KV_ID 和 CF_API_TOKEN 環境變數");
  console.error("   FEED_KV_ID: KV namespace ID（從 Cloudflare Dashboard 複製）");
  console.error("   CF_API_TOKEN: Cloudflare API Token");
  process.exit(1);
}

async function main() {
  const fs = await import('fs');
  const raw = fs.readFileSync('./feed/data.json', 'utf-8');
  const entries = JSON.parse(raw);

  console.log(`📦 讀取 ${entries.length} 則既有訊息…`);

  // 寫入 feed:entries
  const res1 = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_ID}/values/feed:entries`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entries),
    }
  );
  if (!res1.ok) {
    const err = await res1.json();
    console.error('❌ 寫入 feed:entries 失敗:', JSON.stringify(err));
    process.exit(1);
  }

  // 寫入 feed:counter（取最大 id）
  const maxId = Math.max(...entries.map(e => parseInt(e.id.replace('msg_', ''), 10)));
  await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_ID}/values/feed:counter`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'text/plain',
      },
      body: String(maxId),
    }
  );

  console.log(`✅ 已匯入 ${entries.length} 則訊息到 KV（counter=${maxId}）`);
}

main();
