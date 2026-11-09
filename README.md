# YT Hotkeys

Six rebindable YouTube shortcuts. Draws nothing on the page, and is the **only** script in this
collection that binds a `keydown` listener.

| Key | Action |
|---|---|
| `a` | Like |
| `d` | Dislike |
| `n` | Next video |
| `p` | Previous video |
| `Shift`+`a` | Like, then next |
| `Shift`+`d` | Dislike, then next |

## Install

Read the [install guide](https://github.com/chirag127/userscript-install-guide), then:

```
https://github.com/chirag127/yt-hotkeys-userscript/raw/main/yt-hotkeys-userscript.user.js
```

Requires [`yt-core-lib`](https://github.com/chirag127/yt-core-lib), pulled in automatically with
`@require` — you do not install it.

## Settings — script menu only

Click the ScriptCat icon → **YT Hotkeys**:

| Entry | Does |
|---|---|
| `Rebind <action>…` (six entries) | set a new key for one action |
| `Hotkeys: reset to defaults` | back to `a d n p Shift+a Shift+d` |
| `Hotkeys: show all` | current bindings + YouTube's reserved keys |
| `Hotkeys: toggle feedback toast` | the only optional page UI, off by default |

Bindings live in shared storage (`ytk.hotkeys`), so ScriptCat's cloud sync carries them between
browsers.

## Rules this script follows

- Never fires while typing (input, textarea, select, contenteditable, comment box).
- Holding `n`/`p` repeats; holding `a`/`d` does not, because a like is a toggle.
- `Shift+a` and `a` are distinct bindings — the matcher records modifiers.
- Every rebind is checked for conflicts before it is saved.

YouTube already uses `j k l f m c t i`, digits, arrows, space, `< > , .` and `Shift+n` / `Shift+p`.

## Why it is its own repo

It used to live inside `yt-toolkit-userscript`, where the keyboard was owned by a file that also
drew a toolbar. Now there is exactly one owner. The shared plumbing (storage, settings, UI helpers)
comes from `yt-core-lib` via `@require`, so nothing is duplicated.

The file name `yt-hotkeys-userscript.user.js` is canonical: existing installs point their
`@updateURL` here, so renaming it would silently stop their auto-update.

## License

MIT
