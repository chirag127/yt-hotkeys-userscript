# AGENTS.md - yt-hotkeys-userscript

Single-file userscript. `yt-hotkeys-userscript.user.js` at repo root IS the product. No build, no deps, `@grant none`.

## Method

One userscript, six actions, **zero UI overlay**. Listens for `keydown` on `window` (capture), guarded by `isTyping()` so nothing fires while the user types. Rebinding happens through a right-click context menu item ("YouTube Hotkeys settings…") on YouTube pages, plus `GM_registerMenuCommand`-style access via the ScriptCat extension menu. Keys are stored in `localStorage` under `yt-hk-keys`.

Default keys: like `a`, dislike `d`, next `n`, previous `p`, like+next `q`, dislike+next `w`.

## Rules

- One file, zero build step, `@grant none`.
- `@match https://www.youtube.com/*` — intentional, this is a general YouTube hotkey tool.
- **No UI chips/panels** injected into YouTube's page (they overlapped and broke the UI).
- Right-click context menu + ScriptCat menu are the only settings surfaces.
- Default keys avoid YouTube's reserved keys (`j k l f m c t i`, digits, arrows, space, `< >`, `, .`, `Shift+N/P`).
- Combos wait 220 ms between the rating action and navigation.

## Install docs

Shared guide: https://github.com/chirag127/userscript-install-guide

## Test

`sctl install ./yt-hotkeys-userscript.user.js`, open a watch page, press `a`/`d`/`n`/`p`/`q`/`w`, confirm the toast. Right-click → settings → rebind. Confirm nothing fires while typing in an input.

Documentation is single-sourced at `c:\ws\docs\okf\`. Your note: `c:\ws\docs\okf\scripts\yt-hotkeys-userscript.md`. Do not create an `okf/` folder here.
