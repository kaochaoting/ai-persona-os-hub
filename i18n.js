/* ── AI Persona OS Hub 多語系系統 v1.0 ── */
(function() {
  'use strict';

  const SUPPORTED_LANGS = ['zh-TW', 'en'];
  const DEFAULT_LANG = 'zh-TW';
  const STORAGE_KEY = 'aios_lang';

  // ── 語言偵測 ──
  function detectLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;

    const navLang = (navigator.language || '').toLowerCase();
    if (navLang.startsWith('en')) return 'en';
    // 預設繁體中文
    return 'zh-TW';
  }

  // ── 取得當前語言（從 URL path 判斷） ──
  function currentLang() {
    const path = window.location.pathname;
    if (path.startsWith('/en/')) return 'en';
    // 未來支援： if (path.startsWith('/ja/')) return 'ja';
    return 'zh-TW';
  }

  // ── 取得同頁面其他語言版本的路徑 ──
  function langPath(targetLang) {
    const path = window.location.pathname;
    const page = path.replace(/^\/(en|zh-TW|ja)\//, '/');
    if (targetLang === DEFAULT_LANG) {
      return page || '/';
    }
    return '/' + targetLang + (page || '/index.html').replace(/\/$/, '/index.html');
  }

  // ── 自動導向 ──
  const detected = detectLang();
  const current = currentLang();

  if (detected !== current && !window.location.pathname.startsWith('/' + detected + '/')) {
    const target = langPath(detected);
    if (target !== window.location.pathname) {
      localStorage.setItem(STORAGE_KEY, detected);
      window.location.href = target;
      return;
    }
  }

  // ── 語言切換器 UI ──
  function createSwitcher() {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'lang-switcher';
    wrapper.style.cssText = 'position:relative;margin-left:0.5rem';

    const btn = document.createElement('button');
    btn.className = 'lang-btn';
    btn.textContent = current === 'en' ? '🌐 EN' : '🌐 繁';
    btn.style.cssText = [
      'background:none;border:1px solid var(--border);border-radius:4px;',
      'padding:0.25rem 0.5rem;font-size:0.75rem;cursor:pointer;',
      'color:var(--text-dim);transition:all 0.2s'
    ].join('');
    btn.onmouseover = function() { this.style.borderColor = 'var(--accent)'; this.style.color = 'var(--accent)'; };
    btn.onmouseout = function() { this.style.borderColor = ''; this.style.color = ''; };

    const menu = document.createElement('div');
    menu.className = 'lang-menu';
    menu.style.cssText = [
      'display:none;position:absolute;top:100%;right:0;margin-top:4px;',
      'background:var(--bg-card);border:1px solid var(--border);border-radius:6px;',
      'min-width:120px;box-shadow:0 4px 12px rgba(0,0,0,0.08);z-index:100;overflow:hidden'
    ].join('');

    SUPPORTED_LANGS.forEach(function(lang) {
      const label = lang === 'zh-TW' ? '繁體中文' : 'English';
      const item = document.createElement('a');
      item.href = langPath(lang);
      item.textContent = label;
      item.style.cssText = [
        'display:block;padding:0.5rem 0.75rem;font-size:0.8rem;',
        'color:var(--text);text-decoration:none;transition:background 0.15s'
      ].join('');
      item.onmouseover = function() { this.style.background = 'var(--hover)'; };
      item.onmouseout = function() { this.style.background = ''; };
      item.onclick = function() { localStorage.setItem(STORAGE_KEY, lang); };
      menu.appendChild(item);
    });

    btn.onclick = function(e) {
      e.stopPropagation();
      const isVisible = menu.style.display === 'block';
      menu.style.display = isVisible ? 'none' : 'block';
    };
    document.addEventListener('click', function() { menu.style.display = 'none'; });

    wrapper.appendChild(btn);
    wrapper.appendChild(menu);
    nav.appendChild(wrapper);
  }

  // ── hreflang meta tags ──
  function addHreflang() {
    const path = window.location.pathname.replace(/^\/(en|zh-TW)\//, '/');
    const head = document.head;

    SUPPORTED_LANGS.forEach(function(lang) {
      var link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      var href = lang === DEFAULT_LANG ? path : '/' + lang + (path || '/index.html');
      link.href = window.location.origin + href.replace(/\/$/, '/index.html');
      head.appendChild(link);
    });

    // x-default = zh-TW
    var xd = document.createElement('link');
    xd.rel = 'alternate';
    xd.hreflang = 'x-default';
    xd.href = window.location.origin + (path || '/');
    head.appendChild(xd);
  }

  // ── 初始化 ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      addHreflang();
      createSwitcher();
    });
  } else {
    addHreflang();
    createSwitcher();
  }
})();
