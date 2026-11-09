// ==UserScript==
// @name         YouTube Hotkeys
// @namespace    https://github.com/chirag127
// @version      2.0.0
// @description  Six rebindable YouTube shortcuts — like (a), dislike (d), next (n), previous (p), like+next (q), dislike+next (w). No UI overlay; settings via right-click context menu or the ScriptCat menu. Nothing fires while you type.
// @author       chirag127
// @license      MIT
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @icon         https://www.youtube.com/favicon.ico
// @homepageURL  https://github.com/chirag127/yt-hotkeys-userscript
// @supportURL   https://github.com/chirag127/yt-hotkeys-userscript/issues
// @downloadURL  https://github.com/chirag127/yt-hotkeys-userscript/raw/main/yt-hotkeys-userscript.user.js
// @updateURL    https://github.com/chirag127/yt-hotkeys-userscript/raw/main/yt-hotkeys-userscript.user.js
// @grant        none
// @noframes
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * One userscript, six actions, zero UI overlay. Keys are stored in
   * localStorage under "yt-hk-keys" and rebound through the page's
   * right-click context menu (or ScriptCat's built-in menu commands).
   * Nothing fires while the user is typing.
   * ------------------------------------------------------------------ */

  const STORAGE_KEY = "yt-hk-keys";
  const DEFAULTS = {
    like: "a",
    dislike: "d",
    next: "n",
    prev: "p",
    likenext: "q",
    dislikenext: "w",
  };

  const LIKE_SEL = ["button[aria-label^='like']", "button[aria-label*='Like this video']"];
  const DISLIKE_SEL = ["button[aria-label*='Dislike this video']", "button[aria-label*='Dislake']"];
  const NEXT_SEL = ".ytp-next-button";
  const PREV_SEL = ".ytp-prev-button";

  const isTyping = () => {
    const el = document.activeElement;
    if (!el) return false;
    const tag = (el.tagName || "").toUpperCase();
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
  };

  const getKeys = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const k = raw ? JSON.parse(raw) : {};
      // fill in any missing defaults
      for (const [id, def] of Object.entries(DEFAULTS)) {
        if (!k[id]) k[id] = def;
      }
      return k;
    } catch {
      return { ...DEFAULTS };
    }
  };
  const setKeys = (k) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(k)); } catch {}
  };

  const keyOf = (id) => String((getKeys()[id] || DEFAULTS[id])).toLowerCase();

  const combo = (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    return (e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey ? "Shift+" : "") + k;
  };

  const pressLike = () => {
    const btn = document.querySelector(LIKE_SEL[0]) || document.querySelector(LIKE_SEL[1]);
    if (!btn) return false;
    const pressed = btn.getAttribute("aria-pressed") === "true";
    if (!pressed) btn.click();
    return true;
  };
  const pressDislike = () => {
    const btn = document.querySelector(DISLIKE_SEL[0]) || document.querySelector(DISLIKE_SEL[1]);
    if (!btn) return false;
    const pressed = btn.getAttribute("aria-pressed") === "true";
    if (!pressed) btn.click();
    return true;
  };
  const pressNext = () => {
    const b = document.querySelector(NEXT_SEL);
    if (!b) return false;
    b.click();
    return true;
  };
  const pressPrev = () => {
    const b = document.querySelector(PREV_SEL);
    if (!b) return false;
    b.click();
    return true;
  };

  // ---------- feedback toast ----------
  let toastEl = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      Object.assign(toastEl.style, {
        position: "fixed", zIndex: 2147483647, left: "50%", bottom: "12%",
        transform: "translateX(-50%)", background: "rgba(0,0,0,.86)", color: "#fff",
        padding: "9px 15px", borderRadius: "8px", font: "14px Roboto, Arial",
        pointerEvents: "none", transition: "opacity .25s", opacity: "0",
      });
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.opacity = "1";
    clearTimeout(toastEl._h);
    toastEl._h = setTimeout(() => (toastEl.style.opacity = "0"), 900);
  }

  // ---------- actions ----------
  const ACTIONS = [
    { id: "like", label: "Like / unlike", def: "a", run: () => { if (pressLike()) toast("👍 Liked"); else toast("👍 Button not found"); } },
    { id: "dislike", label: "Dislike / undislike", def: "d", run: () => { if (pressDislike()) toast("👎 Disliked"); else toast("👎 Button not found"); } },
    { id: "next", label: "Next video", def: "n", run: () => { if (pressNext()) toast("⏭️ Next"); else toast("No next video"); } },
    { id: "prev", label: "Previous video", def: "p", run: () => { if (pressPrev()) toast("⏮️ Previous"); else toast("No previous video"); } },
    { id: "likenext", label: "Like + next", def: "q", run: () => { if (pressLike()) { setTimeout(() => pressNext() || toast("No next video"), 220); toast("👍 Liked → ⏭️ Next"); } else toast("👍 Button not found"); } },
    { id: "dislikenext", label: "Dislike + next", def: "w", run: () => { if (pressDislike()) { setTimeout(() => pressNext() || toast("No next video"), 220); toast("👎 Disliked → ⏭️ Next"); } else toast("👎 Button not found"); } },
  ];

  // ---------- keydown dispatch ----------
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (isTyping()) return;
    const pressed = combo(e).toLowerCase();
    const action = ACTIONS.find((a) => keyOf(a.id) === pressed);
    if (!action) return;
    e.preventDefault();
    e.stopPropagation();
    try { action.run(); } catch (err) { toast("Failed: " + err.message); }
  }, true);

  // ---------- right-click context menu for settings ----------
  const MENU_ID = "yt-hk-settings";
  document.addEventListener("contextmenu", (e) => {
    // Only add our item on YouTube video/watch pages
    if (!location.hostname.includes("youtube.com")) return;
    const item = document.createElement("div");
    item.textContent = "YouTube Hotkeys settings…";
    Object.assign(item.style, {
      position: "fixed", left: e.clientX + "px", top: e.clientY + "px",
      zIndex: 2147483647, background: "#181818", color: "#fff",
      border: "1px solid #3a3a3a", borderRadius: "6px", padding: "6px 10px",
      font: "13px Roboto, Arial", cursor: "pointer", whiteSpace: "nowrap",
      boxShadow: "0 4px 12px rgba(0,0,0,.6)",
    });
    item.onclick = () => { document.body.removeChild(item); openSettings(); };
    document.body.appendChild(item);
    // remove after 4 seconds if not clicked
    setTimeout(() => { if (document.body.contains(item)) document.body.removeChild(item); }, 4000);
    // dismiss on any other click
    const dismiss = () => { if (document.body.contains(item)) document.body.removeChild(item); document.removeEventListener("click", dismiss); };
    document.addEventListener("click", dismiss, { once: true });
  }, true);

  // ---------- settings panel ----------
  let panel = null;
  function openSettings() {
    if (panel) { panel.remove(); panel = null; return; }
    panel = document.createElement("div");
    Object.assign(panel.style, {
      position: "fixed", right: "16px", top: "16px", width: "300px",
      zIndex: 2147483647, background: "#181818", color: "#fff", border: "1px solid #3a3a3a",
      borderRadius: "10px", font: "12px Roboto, Arial", overflow: "hidden",
      boxShadow: "0 10px 30px rgba(0,0,0,.7)",
    });

    const head = document.createElement("div");
    Object.assign(head.style, { padding: "9px", background: "#242424", display: "flex", alignItems: "center", gap: "6px", cursor: "move" });
    const title = document.createElement("strong");
    title.textContent = "YouTube Hotkeys settings";
    title.style.flex = "1";
    const close = document.createElement("button");
    close.textContent = "×";
    Object.assign(close.style, { background: "#333", color: "#fff", border: "0", borderRadius: "5px", padding: "2px 7px", cursor: "pointer", font: "inherit" });
    close.onclick = () => { panel.remove(); panel = null; };
    head.append(title, close);

    const body = document.createElement("div");
    body.style.padding = "6px";

    const hint = document.createElement("div");
    hint.textContent = "Right-click anywhere on YouTube to reopen.";
    hint.style.cssText = "color:#888;margin-bottom:8px;font-size:11px";
    body.appendChild(hint);

    const rows = document.createElement("div");
    rows.style.cssText = "display:flex;flex-direction:column;gap:4px";
    body.appendChild(rows);

    function render() {
      rows.textContent = "";
      const keys = getKeys();
      for (const a of ACTIONS) {
        const row = document.createElement("div");
        row.style.cssText = "display:flex;gap:6px;align-items:center;padding:4px;border-bottom:1px solid #262626";
        const lab = document.createElement("span");
        lab.textContent = a.label;
        lab.style.cssText = "flex:1;color:#ddd";
        const kb = document.createElement("button");
        kb.textContent = (keys[a.id] || a.def).toUpperCase();
        Object.assign(kb.style, { minWidth: "56px", background: "#065fd4", color: "#fff", border: "0", borderRadius: "5px", padding: "3px 7px", cursor: "pointer", font: "inherit" });
        kb.onclick = () => capture(a);
        row.append(lab, kb);
        rows.appendChild(row);
      }
      const reset = document.createElement("button");
      reset.textContent = "Reset all to defaults";
      Object.assign(reset.style, { marginTop: "6px", background: "#333", color: "#fff", border: "0", borderRadius: "5px", padding: "4px 8px", cursor: "pointer", font: "inherit", width: "100%" });
      reset.onclick = () => { localStorage.removeItem(STORAGE_KEY); render(); toast("Defaults restored"); };
      rows.appendChild(reset);
    }

    function capture(a) {
      toast("Press a key for " + a.label);
      const grab = (e) => {
        if (e.key === "Escape") { removeEventListener("keydown", grab, true); return; }
        if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
        e.preventDefault();
        e.stopPropagation();
        const all = getKeys();
        all[a.id] = combo(e).toLowerCase();
        setKeys(all);
        removeEventListener("keydown", grab, true);
        render();
        toast(a.label + " → " + combo(e).toUpperCase());
      };
      addEventListener("keydown", grab, true);
    }

    render();

    panel.append(head, body);
    document.body.appendChild(panel);

    let dragOn = false, dragSx = 0, dragSy = 0, dragOx = 0, dragOy = 0;
    head.addEventListener("pointerdown", (e) => { if (e.target.tagName === "BUTTON") return; dragOn = true; dragSx = e.clientX; dragSy = e.clientY; const r = panel.getBoundingClientRect(); dragOx = r.left; dragOy = r.top; panel.style.right = "auto"; panel.style.bottom = "auto"; panel.style.left = dragOx + "px"; panel.style.top = dragOy + "px"; head.setPointerCapture(e.pointerId); });
    head.addEventListener("pointermove", (e) => { if (!dragOn) return; panel.style.left = Math.max(0, dragOx + e.clientX - dragSx) + "px"; panel.style.top = Math.max(0, dragOy + e.clientY - dragSy) + "px"; });
    head.addEventListener("pointerup", () => (dragOn = false));
  }

  // ensure defaults exist on first load
  getKeys();
})();
