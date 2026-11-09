# AGENTS.md — yt-hotkeys-userscript

Read the collection [`AGENTS.md`](../AGENTS.md) and [`PLAN.md`](../PLAN.md) first.

## What this is

The six rebindable shortcuts, extracted from the old all-in-one toolkit. It requires
`yt-core-lib` for storage and UI helpers, so it contains **no InnerTube, AI or settings code**.

## Non-negotiables

1. **This is the only script in the collection that binds a `keydown` listener.** If another script
   needs a shortcut, the shortcut is added here. Two scripts binding the same key was a real
   failure the user hit; do not reintroduce it.
2. **Draw nothing at load.** The only optional page UI is the feedback toast, off by default.
3. **Never fire while typing** — input, textarea, select, contenteditable, `#contenteditable-root`,
   comment box.
4. **`repeat` is per action**: allowed for next/previous, blocked for like/dislike because a like
   is a toggle.
5. **`Shift+a` and `a` are distinct bindings.** The combo string records modifiers in a fixed
   order: `ctrl`, `alt`, `shift`, `meta`, then the lowercase key.
6. **Conflict check on rebind.** Refuse a combo already bound to another action.

## File name

`yt-hotkeys-userscript.user.js` — canonical, because existing installs point their
`@updateURL` at this path. Do not rename it; a rename silently stops auto-update for every
existing install.

## Settings

Everything is in the ScriptCat menu (`GM_registerMenuCommand`), one entry per action plus reset,
show-all and the feedback toggle. No settings window, no in-page panel.

Bindings live in `ytk.hotkeys` via the core, so ScriptCat cloud sync carries them.
