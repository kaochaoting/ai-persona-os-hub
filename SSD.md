# Hub — Hermes Agent 社群中樞

## 系統設計文檔 (SSD)
> 版本 1.0 · 2026-05-11

---

## 1. 系統架構

```
┌─────────────────────────────────────────────────────────┐
│                     Cloudflare Pages                      │
│                                                          │
│   hub.agentsworld.live                                   │
│                                                          │
│   ┌─────────────────────────────────────────────────┐   │
│   │              Next.js Static Site                  │   │
│   │                                                   │   │
│   │  / (index)         → 首頁                        │   │
│   │  /docs             → AI Persona OS 知識庫         │   │
│   │  /docs/*           → 各篇文章                     │   │
│   │  /agents           → Agent 目錄                   │   │
│   │  /skills           → Skills 市集                  │   │
│   │  /blog             → 部落格                       │   │
│   │  /about            → 關於/連結                    │   │
│   │                                                   │   │
│   └─────────────────────────────────────────────────┘   │
│                                                          │
│   內容來源:                                              │
│   ├─ content/docs/     → Markdown 文件                  │
│   ├─ content/agents/   → JSON Agent 資料               │
│   ├─ content/skills/   → JSON Skills 資料               │
│   └─ content/blog/     → Markdown 文章                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 2. 目錄結構

```
ai-persona-os-hub/
├── content/                       # 內容檔案（版本控制）
│   ├── docs/
│   │   ├── quick-start.md         # 快速開始
│   │   ├── schema-overview.md     # Schema 總覽
│   │   ├── core-modules.md        # 核心模組說明
│   │   ├── integration-guide.md   # 整合指南
│   │   └── philosophy.md          # 哲學
│   ├── agents/
│   │   ├── jarvis.json            # J.A.R.V.I.S.
│   │   └── xiaowen.json           # 小紋
│   ├── skills/
│   │   └── sample.json            # 範例 skill
│   └── blog/
│       ├── hello-world.md         # 第一篇
│       └── persona-os-intro.md    # Persona OS 介紹
├── public/
│   ├── favicon.svg
│   └── images/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # 首頁
│   │   ├── docs/
│   │   │   ├── page.tsx           # 知識庫首頁
│   │   │   └── [slug]/page.tsx    # 文章頁
│   │   ├── agents/
│   │   │   └── page.tsx           # Agent 目錄
│   │   ├── skills/
│   │   │   └── page.tsx           # Skills 市集
│   │   ├── blog/
│   │   │   ├── page.tsx           # 部落格列表
│   │   │   └── [slug]/page.tsx    # 文章內頁
│   │   └── about/
│   │       └── page.tsx           # 關於頁
│   ├── components/
│   │   ├── Header.tsx             # 極簡導航
│   │   ├── Footer.tsx             # 極簡頁尾
│   │   ├── Card.tsx               # 內容卡片
│   │   ├── AgentCard.tsx          # Agent 展示卡
│   │   ├── SkillCard.tsx          # Skill 展示卡
│   │   └── Markdown.tsx           # MD 渲染
│   └── styles/
│       └── globals.css            # 全域樣式（Muji 風格）
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── wrangler.toml                  # Cloudflare Pages 設定
├── PRD.md
└── README.md
```

## 3. 路由設計

| 路徑 | 頁面 | 說明 |
|------|------|------|
| `/` | 首頁 | Hero + 三大入口 + 精選內容 |
| `/docs` | 知識庫 | 文件列表 + 分類 |
| `/docs/[slug]` | 文章 | Markdown 渲染 |
| `/agents` | Agent 目錄 | 卡片式展示牆 |
| `/skills` | Skills 市集 | Skill 卡片列表 |
| `/blog` | 部落格 | 文章時間線 |
| `/blog/[slug]` | 文章 | Markdown 渲染 |
| `/about` | 關於 | 專案介紹 + 連結 |

## 4. 資料模型

### Agent Schema
```typescript
interface Agent {
  id: string
  name: string
  fullName: string
  type: string          // 人格原型：管家、助理、創作者...
  summary: string       // 一句話介紹
  description: string   // 詳細描述
  creator: string       // 建立者
  personality: {
    archetype: string
    style: string       // 溝通風格
  }
  links: {
    github?: string
    discord?: string
  }
  avatar?: string       // 頭像路徑
  featured: boolean     // 是否精選
}
```

### Skill Schema
```typescript
interface Skill {
  id: string
  name: string
  description: string
  category: string
  author: string
  install: string       // 安裝指令或方式
  tags: string[]
  github?: string
  featured: boolean
}
```

## 5. Muji 設計系統

### 5.1 顏色
```css
--bg:        #FAFAF7    /* 暖白背景 */
--bg-card:   #FFFFFF    /* 卡片背景 */
--text:      #2C2C2C    /* 主文字 */
--text-dim:  #888888    /* 次要文字 */
--accent:    #8B7355    /* 強調暖棕 */
--border:    #E8E4DE    /* 分隔線 */
--hover:     #F0EDE6    /* 懸停背景 */
```

### 5.2 間距系統
```css
--space-xs:  0.5rem    /* 8px */
--space-sm:  1rem      /* 16px */
--space-md:  2rem      /* 32px */
--space-lg:  4rem      /* 64px */
--space-xl:  8rem      /* 128px */
```

### 5.3 元件規範
- **卡片**：白底 + 極淺影子 + 無圓角或極小圓角 (4px)
- **連結**：無底線，懸停時文字變暖棕
- **按鈕**：無填充文字按鈕，hover 變暖棕
- **導航**：左上 logo + 右側極簡選單，固定在頂部
- **分隔線**：1px `#E8E4DE` hr
- **列表**：無符號列表，純文字

## 6. 部署架構

```yaml
platform: Cloudflare Pages
domain: hub.agentsworld.live
build:
  command: npm run build
  output: out/
  environment: production
features:
  - Auto HTTPS (Cloudflare SSL)
  - Global CDN
  - DDoS Protection
  - Zero-config custom domain
```

## 7. 效能目標

| 指標 | 目標 | 實現方式 |
|------|------|---------|
| FCP | < 1.5s | Static Generation + CDN |
| LCP | < 2.0s | 圖片優化 + lazy loading |
| TTI | < 2.0s | 靜態內容 + 無 JS 依賴 |
| 檔案大小 | < 100KB initial | Next.js 自動 code splitting |
