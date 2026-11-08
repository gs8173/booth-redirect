(() => {
  "use strict";

  // 형태 찾기
  const m = location.pathname.match(
    /^\/(?:([a-z]{2}(?:-[a-z]{2,4})?)\/)?items\/(\d+)\/?$/i
  );
  if (!m) return;

  const lang = m[1] || "ja";
  const itemId = m[2];
  const suffix = location.search + location.hash;
  const cacheKey = "shop:" + itemId;

  // 부스 호스트
  const RESERVED = new Set([
    "booth.pm", "www.booth.pm", "accounts.booth.pm", "manage.booth.pm",
    "checkout.booth.pm", "api.booth.pm", "s.booth.pm", "asset.booth.pm",
    "help.booth.pm", "docs.booth.pm", "lp.booth.pm"
  ]);

  let done = false;

  const isShopHost = (host) =>
    /^[a-z0-9][a-z0-9-]*\.booth\.pm$/i.test(host) && !RESERVED.has(host.toLowerCase());

  const redirectTo = (host) => {
    if (done || !isShopHost(host)) return false;
    done = true;
    location.replace(`https://${host}/items/${itemId}${suffix}`);
    return true;
  };

  const saveCache = (host) => {
    try { chrome.storage.local.set({ [cacheKey]: host }); } catch (_) {}
  };

  // 1) 캐시 → 2) 아이템 JSON → 3) 페이지 내 링크 순서로 제작자 주소를 찾음
  const fromJson = async () => {
    const res = await fetch(`https://booth.pm/${lang}/items/${itemId}.json`, {
      credentials: "include",
      headers: { Accept: "application/json" }
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const shopUrl = data?.shop?.url;
    if (shopUrl) return new URL(shopUrl).hostname;
    if (data?.shop?.subdomain) return `${data.shop.subdomain}.booth.pm`;
    throw new Error("shop 정보 없음");
  };

  const fromDom = () => {
    const counts = new Map();
    for (const a of document.querySelectorAll("a[href]")) {
      let host;
      try { host = new URL(a.href, location.href).hostname; } catch (_) { continue; }
      if (isShopHost(host)) counts.set(host, (counts.get(host) || 0) + 1);
    }
    let best = null, max = 0;
    for (const [h, c] of counts) if (c > max) { best = h; max = c; }
    return best;
  };

  const domFallback = () => {
    const tryDom = () => {
      const host = fromDom();
      if (host) { saveCache(host); redirectTo(host); }
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", tryDom, { once: true });
    } else {
      tryDom();
    }
  };

  const run = async () => {
    try {
      const host = await fromJson();
      saveCache(host);
      redirectTo(host);
    } catch (_) {
      domFallback();
    }
  };

  try {
    chrome.storage.local.get(cacheKey, (r) => {
      const cached = r && r[cacheKey];
      if (cached && redirectTo(cached)) return;
      run();
    });
  } catch (_) {
    run();
  }
})();
