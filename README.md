# Tube Prompt

Tube Prompt is a reusable teleprompter with the warm glow of an old tube television. It is one
self-contained HTML file: download it, open it in a browser, paste a script, and start reading.

## What it does

- smooth automatic scrolling with a word-by-word reading cue
- adjustable pace, type size, line spacing, copy width, and eye line
- optional fullscreen start, countdown, prompt-only mirror mode, and quiet `[stage directions]`
- pause/resume, restart, live timing, and keyboard controls
- plain-text import and download
- local draft persistence in the current browser

While rolling, use `Space` to pause or resume, arrow keys to change pace, `+`/`-` to resize,
`H` to toggle the word cue, `M` to mirror, `R` to restart, `F` for fullscreen, and `E` or `Esc`
to return to the editor.

## Run it

Download [`index.html`](index.html) and open it directly in a modern browser. There is no build,
package installation, account, or server.

The bundled script is the narration used for the Loadshed WebMCP demo. Replace it with anything;
lines enclosed in brackets are shown as stage directions and excluded from spoken-word timing.

## Privacy

Your script stays on your device. Tube Prompt makes no network requests and has no analytics,
camera, microphone, or clipboard access. Browser-local saving uses `localStorage`; use **Download
script** for a portable copy or clear the site's local data to remove the saved draft.

## Verify

Node.js is needed only for the small source checks:

```powershell
node --test test\*.test.js
```

## License

[MIT](LICENSE)
