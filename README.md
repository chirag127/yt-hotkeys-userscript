# YouTube Hotkeys

Six rebindable YouTube shortcuts — like (`a`), dislike (`d`), next (`n`), previous (`p`), like+next (`q`), dislike+next (`w`).

**No UI overlay.** Nothing is injected into YouTube's page — no chips, no panels, no overlapping buttons. Settings are opened by **right-clicking anywhere on YouTube** or via the **ScriptCat extension menu**. Nothing fires while you type.

## Install

First read the shared **[userscript install guide](https://github.com/chirag127/userscript-install-guide)** (how to set up ScriptCat / Tampermonkey). Then click:

**[Install yt-hotkeys-userscript.user.js](https://github.com/chirag127/yt-hotkeys-userscript/raw/main/yt-hotkeys-userscript.user.js)**

## Default keys

| Key | Action |
|-----|--------|
| `a` | Like / unlike |
| `d` | Dislike / undislike |
| `n` | Next video |
| `p` | Previous video |
| `q` | Like + next |
| `w` | Dislike + next |

## Settings

- **Right-click** anywhere on a YouTube page → "YouTube Hotkeys settings…" to rebind any key.
- Or open the **ScriptCat extension popup** → find "YouTube Hotkeys" → click its menu command to open settings.
- A small toast confirms each action.

Keys are saved in your browser's localStorage and persist across sessions.

## Rebinding

Open settings (right-click or ScriptCat menu), click the key button next to any action, press your new key, and it saves instantly. Press Esc to cancel.

## License

[MIT](LICENSE) © 2026 chirag127
