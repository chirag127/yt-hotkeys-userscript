# YT Hotkeys

Six rebindable YouTube shortcuts. Draws nothing on the page, and never fights another script for
the keyboard.

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
https://github.com/chirag127/yt-hotkeys-userscript/raw/main/yt-hotkeys.user.js
```

## Settings — script menu only

Click the ScriptCat icon → **YT Hotkeys**:

| Entry | Does |
|---|---|
| `Rebind <action>…` (six of them) | set a new key for one action |
| `Hotkeys: reset to defaults` | back to `a d n p Shift+a Shift+d` |
| `Hotkeys: show all` | prints current bindings + YouTube's reserved keys |
| `Hotkeys: toggle feedback toast` | the only optional page UI, off by default |

Bindings live in shared storage (`ytk.hotkeys`), so ScriptCat's cloud sync carries them between
browsers.

## Rules this script follows

- **The only keydown owner** in the collection. Another script needing a shortcut must add it here.
- Never fires while typing (input, textarea, select, contenteditable, comment box).
- Holding `n`/`p` repeats; holding `a`/`d` does not, because a like is a toggle.
- `Shift+a` and `a` are distinct bindings.
- Conflict check on every rebind.

YouTube already uses `j k l f m c t i`, digits, arrows, space, `< > , .` and `Shift+n` / `Shift+p`.

## Why it is its own repo

It used to live inside `yt-toolkit-userscript`. Two features in one file meant the keyboard was
owned by a file that also drew a toolbar. Now there is exactly one owner, and the shared core is
pulled in with `@require` so nothing is duplicated.

## License

MIT
